import React from "react"
import { connect } from "react-redux"
import { localeString } from "Utils/time"
import t from "../../utils/translate/translate"

const NotificationsTable = ({ loading, list, error }) => (
  <div className="notifications-table">
    <div className="nt-title">{t("Notifications")}</div>
    <div className="nt-content">
      {loading && <div>{t("Loading...")}</div>}
      {error && <div>{t(error)}</div>}
      {list.map(notification => (
        <div className="nt-row" key={notification.id}>
          {localeString(notification.timestamp)} - {t(notification.message)}
        </div>
      ))}
    </div>
  </div>
)

const mapStateToProps = state => state.notificationsTable

export default connect(mapStateToProps)(NotificationsTable)