import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faAddressCard,
  faBookOpen,
  faBookDead,
  faBroadcastTower,
  faChair,
  faCheckSquare,
  faCloudMoon,
  faCog,
  faCopy,
  faClipboard,
  faDice,
  faDragon,
  faExchangeAlt,
  faExclamationTriangle,
  faFileCode,
  faFileUpload,
  faHandPaper,
  faHandPointRight,
  faHeartbeat,
  faImage,
  faLink,
  faMinusCircle,
  faPeopleArrows,
  faPlusCircle,
  faQuestion,
  faRandom,
  faRedoAlt,
  faSearchMinus,
  faSearchPlus,
  faSkull,
  faSquare,
  faTheaterMasks,
  faTimes,
  faTimesCircle,
  faTrashAlt,
  faUndo,
  faUser,
  faUserEdit,
  faUserFriends,
  faUsers,
  faVenusMars,
  faVoteYea,
  faFlagCheckered
} from '@fortawesome/free-solid-svg-icons'
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons'

// Add icons to library
library.add(
  faAddressCard,
  faBookOpen,
  faBookDead,
  faBroadcastTower,
  faChair,
  faCheckSquare,
  faCloudMoon,
  faCog,
  faCopy,
  faClipboard,
  faDice,
  faDragon,
  faExchangeAlt,
  faExclamationTriangle,
  faFileCode,
  faFileUpload,
  faHandPaper,
  faHandPointRight,
  faHeartbeat,
  faImage,
  faLink,
  faMinusCircle,
  faPeopleArrows,
  faPlusCircle,
  faQuestion,
  faRandom,
  faRedoAlt,
  faSearchMinus,
  faSearchPlus,
  faSkull,
  faSquare,
  faTheaterMasks,
  faTimes,
  faTimesCircle,
  faTrashAlt,
  faUndo,
  faUser,
  faUserEdit,
  faUserFriends,
  faUsers,
  faVenusMars,
  faVoteYea,
  faFlagCheckered,
  faDiscord,
  faGithub
)

const app = createApp(App)
app.use(createPinia())
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
