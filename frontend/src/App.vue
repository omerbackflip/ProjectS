<template>
  <div id="app" data-app>
      <div class="page-container">
        <md-app class="">
          <md-app-content>
              <main-header
              title="Dashboard"
            ></main-header>
          </md-app-content>

        </md-app>
      </div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </div>

</template>

<script>
import {isLoggedIn} from './data/utils';
import MainHeader from './components/MainHeader.vue';

export default {
	name: 'Dashboard',
	data: () => ({
		isDataImported: false,
		isLoggedIn: isLoggedIn() ? true : false,
    drawer: false,
    group:null,
	}),
  components: {
		MainHeader
	},
	methods:{
	}
}
</script>

<style>
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

#app > div > div > main > div.md-app-scroller.md-layout-column.md-flex.md-theme-default.md-scrollbar > div{
  padding-right: 20px !important;
}

.md-toolbar{
  font-weight: 600 !important;
}

.md-title{
  font-weight: 600 !important;
}
.el-header{
	padding: 0 !important;

}
    .v-data-table{
	  margin-top: 49px !important;
  }
@import'~bootstrap/dist/css/bootstrap.css'
</style>