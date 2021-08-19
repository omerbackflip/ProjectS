import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Users from '../components/Users.vue';
import { isLoggedIn } from '../data/utils';
import ImportData from '../components/ImportData.vue';
import PayableItems from '../components/PayableItems.vue';
import ShortListedItems from '../components/ShortListedItems.vue';
import Summary from '../components/Summary.vue';
import Test from '../components/ElementUI.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/users',
    name:'Users',
    component: Users,  
  },
  {
    path: '/payable-items-list',
    name:'Payable-Items',
    component: PayableItems,  
  },
  {
    path: '/import-data',
    name:'Import-Data',
    component: ImportData,  
  },
  {
    path: '/short-listed-items',
    name:'ShortListedItems',
    component: ShortListedItems,  
  },
  {
    path: '/summary',
    name:'Summary',
    component: Summary,  
  }
]

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isLoggedIn()) next({ name: 'Login' })
  else next()
})

export default router
