import * as auth from "../user-auth/user-auth"
import LogModelActions from "../log-model-actions/log-model-actions"

const validate = require("../user-validate/user-validate")
import SQL from "../mysql-pool/mysql-pool"

import NotFound from "../../utils/not-found"

// REFACTOR: remove user-auth model, and merge it to here any more,
import * as userAuth from "../user-auth/user-auth"

import {
  NewUserInterface,
  disabledReason,
  ExistingUserInterface,
  ExistingUserInterfaceCondition,
} from "./types"

import baseDBModel from "../base-db-model/base-db-model"

class User extends baseDBModel<
  NewUserInterface,
  ExistingUserInterface,
  ExistingUserInterfaceCondition
> {
  constructor(sql: SQL) {
    super(sql, "users")
  }

  public async tryGetById(id): Promise<ExistingUserInterface | NotFound> {
    let user = await this.getOne(<any>{ id }) // 'any' becuase ICondition it's a generic interface.
    return user
  }

  public async getOne(
    condition: ExistingUserInterfaceCondition,
  ): Promise<ExistingUserInterface | NotFound> {
    var result = await this.find({ condition })
    if (result.length != 1) {
      return new NotFound()
    } else {
      return result[0]
    }
  }

  public async decreaseBalance(user_id, amount) {
    return this.increaseBalance(user_id, -amount)
  }

  public async increaseBalance(user_id, amount) {
    const user = await this.mustGetUserById(user_id)
    user.balance = user.balance | 0
    user.balance += amount
    return this.update(user_id, user)
  }

  public async generateJWT(user_id, secret) {
    // REFACTOR: move secret to the constructr, as dependency
    return auth.generateJWT(user_id, secret)
  }

  public async createUser(user: NewUserInterface): Promise<number> {
    let { email } = user
    var exist = await this.exist({ email })
    if (exist) {
      throw new Error("email::user email already exists")
    }
    var user2Databse = <any>user
    if (user.plainPassword) {
      user2Databse.password = auth.hashPassword(user.plainPassword)
      delete user2Databse.plainPassword
    }

    let status = await this.insert(user2Databse)

    if (!status.insertId) {
      throw new Error("password::user not inserted")
    } else {
      return status.insertId
      // return this.getOne({ id: status.insertId })
    }
  }
  public async setNewPassword(user_id, new_password): Promise<boolean> {
    var hashed_password = auth.hashPassword(new_password)
    return this.update(user_id, { password: hashed_password })
  }

  public async haveFavorite(leadIds) {
    if (!leadIds.length) return []
    let where = ""
    where = leadIds
      .map(leadId => {
        return `(JSON_SEARCH(doc->>'$.favorites', "one", "${leadId}") IS NOT NULL 
      OR JSON_CONTAINS(doc->>'$.favorites', "${leadId}") = 1)`
      })
      .join(" OR ")
    where = `( ${where} ) AND (doc->>'$.getNotifications' = 'true' OR doc->>'$.getEmails' = 'true')`

    return await this.find({ where })
  }

  // async activateUser({ user_id }: { user_id: number }) {
  //   return await this.updateUser(user_id, { disabled: null })
  // }

  async updateWallet(user_id: number, wallet: string) {
    return await this.updateUser(user_id, { wallet })
  }

  async mustGetUserById(id) {
    var result = await this.tryGetById(id)
    if (result instanceof NotFound) {
      throw new Error("NOT_FOUND")
    } else {
      return result
    }
  }

  async getUserByEmailAndPassword(
    email,
    password,
  ): Promise<ExistingUserInterface | NotFound> {
    let user = await this.getOne({ email })
    if (user instanceof NotFound) {
      return new NotFound()
    }
    if (!auth.comparePassword(password, user.password)) {
      return new NotFound()
    } else {
      return user
    }
  }

  async updateUser(
    userId,
    user: ExistingUserInterfaceCondition,
  ): Promise<boolean> {
    if (user.password) {
      const password_updated = await this.setNewPassword(userId, user.password)
      delete user["password"]
    }
    if (Object.keys(user).length > 0) return this.update(userId, user)
    return
  }

  public async getAllUsers(condition, sort, limit) {
    const records = await this.find({ condition, sort, limit })
    const count = await this.count({ condition })
    return [records, count]
  }
}

export default User
