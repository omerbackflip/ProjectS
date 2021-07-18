<template>
  <div id="app">
      <div class="page-container">
        <md-app class="full-height">
          <md-app-toolbar class="md-primary">
        <div class="row">
            <div v-if="isLoggedIn" @click="logoutApp()" class="col-md-2">
            <md-icon class="cursor-pointer" >logout</md-icon>
          </div>
          <div class="col-md-10">
                <span class="md-title">{{isLoggedIn ? 'Dashboard' : 'Login'}}</span>
          </div>

        </div>
        <div v-show="isLoggedIn" class="row navigation text-center">
            <div :key="route.id" v-for="route of routes">
              <div v-show="!(route.path === '/import-data' && isDataImported)" class="cursor-pointer text-decoration-underline ml-5 mr-2 text-white" @click="redirect(route.path)">
                <md-icon>{{route.icon}}</md-icon>
                <span class="div-text">{{route.title}}</span>
              </div>
            </div>
        </div>    		  
          </md-app-toolbar>
          <md-app-content>
            <router-view/>
          </md-app-content>
        </md-app>
      </div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </div>

</template>

<script>

import {routes} from './data/routes.js';
import {logout,getCount} from './api/index.js';
import {isLoggedIn} from './data/utils';

export default {
	name: 'Dashboard',
	data: () => ({
		menuVisible: false,
		routes: routes,
    isDataImported: false,
    isLoggedIn: isLoggedIn() ? true : false,
	}),
	methods:{
    async checkForData(){
			try {
				const response = await getCount();
				if (response.data && response.data.count > 0 ) {
					this.isDataImported = true;
				}
			} catch (error) {
				console.log(error);
			}
		},
		logoutApp(){
			logout();
      this.isLoggedIn = false;
			this.$router.push('login');
		},
		redirect(path){
			this.$router.push(path);
		}
	},
  created(){
    this.isLoggedIn = isLoggedIn() ? true : false;
    this.checkForData();
  },
}
</script>

<style scoped>
  .md-app {
    max-height: 100%;
    height: 100%;
  }

  .page-container{
    height: 100%;
  }
  .md-drawer {
    width: 220px;
    height: 100%;
    max-width: calc(100vw - 125px);
  }

  .cursor-pointer{
	  cursor: pointer;
  }

  #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

td{
  text-align-last: justify !important;
}

#app > div > div > main > div.md-app-scroller.md-layout-column.md-flex.md-theme-default.md-scrollbar > div{
  padding-right: 20px !important;
}

.md-toolbar{
  font-weight: 600 !important;
}

.md-title{
  font-weight: 600 !important;
}

@import'~bootstrap/dist/css/bootstrap.css'
</style>