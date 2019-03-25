import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { priceString } from "Utils/numbers"

const BalanceWidget = ({ balance }) => (
  <>
    {balance.loading ? null : (
      <div
        data-for="balance-tooltip"
        data-tip="LDCs received to-date"
        className="ldc-balance-widget"
      >
        {balance.total + " LDC"}
      </div>
    )}
  </>
)

const mapStateToProps = state => ({
  balance: state.balance,
})

export default connect(mapStateToProps)(BalanceWidget)
