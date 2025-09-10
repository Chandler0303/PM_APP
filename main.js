import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

import UButton from '@climblee/uv-ui/components/uv-button/uv-button.vue'
import UInput from '@climblee/uv-ui/components/uv-input/uv-input.vue'
import UStatusBar from '@climblee/uv-ui/components/uv-status-bar/uv-status-bar.vue'
import UTags from '@climblee/uv-ui/components/uv-tags/uv-tags.vue'
import UAvatar from '@climblee/uv-ui/components/uv-avatar/uv-avatar.vue'
import UText from '@climblee/uv-ui/components/uv-text/uv-text.vue'
import UIcon from '@climblee/uv-ui/components/uv-icon/uv-icon.vue'
import UEmpty from '@climblee/uv-ui/components/uv-empty/uv-empty.vue'
import ULine from '@climblee/uv-ui/components/uv-line/uv-line.vue'
import UList from '@climblee/uv-ui/components/uv-list/uv-list.vue'
import UListItem from '@climblee/uv-ui/components/uv-list-item/uv-list-item.vue'
import UDivider from '@climblee/uv-ui/components/uv-divider/uv-divider.vue'
import ULineProgress from '@climblee/uv-ui/components/uv-line-progress/uv-line-progress.vue' 
export function createApp() {
	
  const app = createSSRApp(App)
  app.component(UButton.name, UButton)
  app.component(UInput.name, UInput)
  app.component(UStatusBar.name, UStatusBar)
  app.component(UTags.name, UTags)
  app.component(UAvatar.name, UAvatar)
  app.component(UText.name, UText)
   app.component(UIcon.name, UIcon)
   app.component(UEmpty.name, UEmpty)
   app.component(UList.name, UList)
   app.component(UListItem.name, UListItem)
    app.component(ULine.name, ULine)
	 app.component(UDivider.name, UDivider)
	 app.component(ULineProgress.name, ULineProgress)
  return {
    app
  }
}
// #endif