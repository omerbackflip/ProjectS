// This routes are genric routes made by vue automatice once installed vue-router 

import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Users from '../components/Users.vue';
import { isLoggedIn } from '../data/utils';
import PayableItems from '../components/PayableItems.vue';
import ShortListedItems from '../components/ShortListedItems.vue';
import Summary from '../components/Summary.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
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
    name:'Payable Items',
    component: PayableItems,  
  },
  {
    path: '/short-listed-items',
    name:'Short Listed Items',
    component: ShortListedItems,  
  },
  {
    path: '/summary',
    name:'סיכום',
    component: Summary,  
  }
]

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isLoggedIn()) next({ name: 'Login' })
  else {
    next();
  }
})

export default router
