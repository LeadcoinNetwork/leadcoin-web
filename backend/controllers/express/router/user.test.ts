import * as Chance from "chance"
import * as _ from "lodash"

import * as RoutesForTests from "./utils-tests/routes.for.tests"
var { request, emailSenderMock } = RoutesForTests.create()

var chance = Chance()

test("POST /user sign up using wrong username and password", async () => {
  return request
    .post("/user", {
      firstname: "moshe",
    })
    .then(x => {
      var expected =
        '"First name" is required; "Last name" is required; "Email" is required; "Password" is required'
      var actual = JSON.parse(x.error.text).error
      expect(actual).toEqual(expected)
      expect(x.status).toEqual(400)
    })
})

test("GET /me sign up using real username and password", async () => {
  var fname = chance.first()
  var lname = chance.last()
  var x = await request.post("/user").send({
    fname,
    lname,
    password: "KGHasdF987654&*^%$#",
    email: chance.email(),
  })
  expect(_.get(x, "error.text")).toBeFalsy()

  expect(x.status).toEqual(201)
  var tokenFromBody = x.body.token
  var TokenCookie = _.get(x, _.toPath("header['set-cookie'][0]"))
  expect(TokenCookie).toBeTruthy()
  var tokenFromCookie = TokenCookie.replace(/token=(.*?);.*/, "$1")

  // Both tokens are equals
  expect(tokenFromBody).toEqual(tokenFromCookie)

  // Tokens are secured and not empty
  expect(tokenFromBody.length).toBeGreaterThan(10)

  var x = await request.get("/me").set({
    cookie: "token=" + tokenFromBody,
  })
  expect(_.get(x, "error.text")).toBeFalsy()
  expect(_.get(x, "body.user.fname")).toBe(fname)
  return true
})
