import React from "react"
import { storiesOf } from "@storybook/react"
import * as actions from "actions"
import { createStoreAndStory } from "storybook-utils/withRouter"

storiesOf("Containers/AddLead")
  .add("AddLead - empty", () => {
    var { store, story } = createStoreAndStory({
      path: "/add-lead",
      loggedIn: true,
    })
    return story
  })
  .add("AddLead - with fields", () => {
    var { store, story } = createStoreAndStory({
      path: "/add-lead",
      loggedIn: true,
    })
    store.dispatch(
      actions.addLead.addLeadGetDbFields({
        private: ["name", "phone"],
        public: ["floor", "size"],
      }),
    )
    return story
  })
  .add("AddLead - after submit", () => {
    var { store, story } = createStoreAndStory({
      path: "/add-lead",
      loggedIn: true,
    })
    store.dispatch(
      actions.addLead.addLeadGetDbFields({
        private: ["name", "phone"],
        public: ["floor", "size"],
      }),
    )
    store.dispatch(actions.addLead.addLeadLoadingStart())
    return story
  })
  .add("AddLead - with erros", () => {
    var { store, story } = createStoreAndStory({
      path: "/add-lead",
      loggedIn: true,
    })
    store.dispatch(
      actions.addLead.addLeadGetDbFields({
        private: ["name", "phone"],
        public: ["floor", "size"],
      }),
    )
    store.dispatch(actions.addLead.addLeadAddError("size", "too short"))
    store.dispatch(actions.addLead.addLeadAddError("phone", "is not valid"))
    return story
  })