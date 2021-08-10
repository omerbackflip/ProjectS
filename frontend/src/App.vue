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
        <div v-show="isLoggedIn" class="row ml-4 navigation text-center">
            <div class="row" :key="route.id" v-for="route of routes">
              <template v-if="!(route.children.length)">
                <div class="cursor-pointer col margin-top-12 font-weight-bold text-decoration-underline ml-5 mr-2 text-white" @click="redirect(route.path)">
                  <md-icon>{{route.icon}}</md-icon>
                  <span class="div-text">{{route.title}}</span>
                </div>
              </template>
              <template v-if="route.children.length">
                <div class="dropdown col">
                  <button class="btn text-white font-weight-bold dropdown-toggle " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <md-icon>{{route.icon}}</md-icon>
                    {{route.title}}
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="child of route.children">
                      <span @click="navigateTo(child)" :key="child.title" class="dropdown-item cursor-pointer">{{child.title}}</span>
                    </template>
                  </div>
                </div>
              </template>
            </div>
						<!-- import payable items -->
						<div>
							<md-dialog :md-active.sync="importPayable">
							<md-dialog-title>Import payable items</md-dialog-title>
							<div class="container">
									<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
											{{message}}
									</div>
									<div class="import-wrapper">
											<h2>Import Payable Items Sheet</h2>
											<div class="mt-3 import-file-wrapper">
													<div class="row">
															<div class="col">
																	Please select the document to import
															</div>
															<div class="col">
																	<input 
																			@change="onFileSelect($event)" 
																			id="fileSelect" 
													ref="fileInput"
																			type="file" 
																			:disabled="disableFileUpload"
																			accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
																	/>  
															</div>
													</div>
											</div>
											<div class="mt-3 mb-3">
													<button :disabled="disableFileUpload || !file" @click = "importData()" class="btn btn-success">
															Import Data
													</button>
											</div>
									</div>
							</div>
							</md-dialog>
						</div>

						<!-- Import short listed items -->
						<div>
							<md-dialog :md-active.sync="importShortlist">
							<md-dialog-title>Import Short List items</md-dialog-title>
							<div class="container p-4">
								<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
									{{message}}
								</div>
								<div class="row">
									<div class="float-right">
										<input 
											@change="onShortListFileSelect($event)" 
											id="fileSelect" 
											ref="fileInput"
											type="file" 
											accept=".xlsx, application/vnd.openxmlformds-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
										/>
									<button @click = "shortListItems()" class="mt-2 mb-2 btn btn-success">
										Short List
									</button>

									</div>
								</div>
							</div>
							</md-dialog>
						</div>

						<!-- Copy short list items -->
						<div>
							<md-dialog :md-active.sync="copyUser">
							<md-dialog-title>Copy Items</md-dialog-title>
							<div class="container">
									<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
											{{message}}
									</div>
									<div class="import-wrapper">
											<div class="mt-3 import-file-wrapper">
												<template>
														<div class="md-layout md-gutter user-copy-wrapper">
															<div class="md-layout-item">
																<md-field>
																	<label for="movies">Users</label>
																	<md-select  v-model="selectedUsers" name="movies" id="movies" multiple>
																		<md-option :key="data._id" v-for="data of users" :value="data.userName">{{`${data.firstName} ${data.lastName}`}}</md-option>
																	</md-select>
																</md-field>
															</div>
														</div>
													</template>
											</div>
											<div class="mt-3 mb-3">
													<button :disabled="!(selectedUsers.length)" @click = "copyShortList()" class="btn btn-success">
															Submit
													</button>
											</div>
									</div>
							</div>
							</md-dialog>
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
import {
	logout,
	deletePayableItems,
	deleteShortListedItems,
	exportData,
	importDataFile,
	importShortListDataFile,
	getAllUsers,
	copyShortListUser
} from './api/index.js';
import {isLoggedIn} from './data/utils';
import {getUser} from './data/utils';

export default {
	name: 'Dashboard',
	data: () => ({
		menuVisible: false,
		routes: routes,
    isDataImported: false,
    isLoggedIn: isLoggedIn() ? true : false,
		importPayable: false,
		importShortlist: false,
		shortListFile: '',
		user : {},
		copyUser: false,
		file: '',
		message : '',
		users: [],
		selectedUsers: [],
		messageType : 'danger',
		disableFileUpload : false,
	}),
	methods:{
		logoutApp(){
			logout();
      this.isLoggedIn = false;
			this.$router.push('login');
		},
		redirect(path){
			this.$router.push(path);
		},
    navigateTo(child) {
      if(child.path) {
        this.redirect(child.path);
      } else {
				switch(child.action) {
					case 'import payable items':
						this.importPayable = true;
						break;
					case 'delete payable items':
						this.deletePayableItems();
						break;
					case 'import short listed items':
						this.importShortlist = true;
						break;
					case 'delete short listed items':
						this.deleteShortLists();
						break;
					case 'export short listed items':
						this.exportExcel();
						break;
					case 'copy short listed items':
						this.copyUser = true;
						break;
				}
			}
    },
		async deletePayableItems() {
			if(window.confirm("Are you sure you want to delete all payable items? This will also delete referenced short listed items!")){
				const response = await deletePayableItems();
				if(response && !(response.hasErrors)) {
					this.message = "payable items successfully deleted!";
					this.messageType = "success";
					window.location.reload();
				} else {
					this.message = "Coundn't delete payable items !";
					this.messageType = "danger";
				}
			}
		},
		async deleteShortLists() {
			if(window.confirm("Are you sure you want to delete all short listed items?")){
				const response = await deleteShortListedItems(this.user.userName);
				if(response && !(response.hasErrors)) {
					this.message = "short listed successfully deleted!";
					this.messageType = "success";
					window.location.reload();
				} else {
					this.message = "Coundn't delete short listed !";
					this.messageType = "danger";
				}
			}
		},
		async exportExcel(){
			try {
				window.open(`${exportData}?userName=${this.user.userName}`);	
			} catch (error) {
				console.log(error);
			}
		},
		onFileSelect(event) {
			event.preventDefault();
			if (event && event.target && event.target.files[0]) {
				const {name , size} = event.target.files[0];
				const type = this.getExtension(name);
				if (!(['.xls','.xlsx'].includes(type))) {
					this.message = `Sorry! ${type} is not supported!`;
					this.messageType = 'danger';
					setTimeout(() => this.message = '', 4000);
					this.$refs.fileInput.value=null;
					return;
				} else if ((size / 1024 / 1024) > 25) {
					this.message = `Sorry, your file size exceeds the limit.`;
					this.messageType = 'danger';
					setTimeout(() => this.message = '', 4000);	
					this.$refs.fileInput.value=null;
					return;
				}
				this.file = event.target.files[0];
			}
		},
		async importData(){
			try {
				if(this.file){
					const response = await importDataFile(this.file);
					if(response.data && !(response.data.hasErrors)) {
						this.message = response.data.message;
						this.messageType = 'success';
						this.importPayable = false;
						window.location.reload();
						this.$refs.fileInput.value=null;
						setTimeout(() => this.message = '', 4000);	
						this.disableFileUpload = true;
					}
				}		
			} catch (error) {
				console.log(error);
			}
		}, 
		showMessage(message,type){
			this.message = message;
			this.messageType = type;
			setTimeout(() => this.message = '', 4000);	
		},
		onShortListFileSelect(event) {
			event.preventDefault();
			if (event && event.target && event.target.files[0]) {
				const {name , size} = event.target.files[0];
				const type = this.getExtension(name);
				if (!(['.xls','.xlsx'].includes(type))) {
					this.showMessage(`Sorry! ${type} is not supported!` , 'danger');
					return;
				} else if ((size / 1024 / 1024) > 1) {
					this.showMessage(`Sorry, your file size exceeds the limit.` , 'danger');
					return;
				}
				this.shortListFile = event.target.files[0];
			}
		},
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
		},
		async getUsers() {
			try {
				const response = await getAllUsers();
				if(response.data && !(response.data.hasErrors)) {
					this.users = response.data.result.users.filter(user => user.userName!==this.user.userName);
				} 		
			} catch (error) {
				console.log(error);
			}
		},
		async shortListItems() {
			try {
				if(this.shortListFile) {
					const response = await importShortListDataFile(this.shortListFile , this.user.userName);
					if (response.data && !(response.data.hasErrors)) {
						this.showMessage(response.data.message,'success');
						this.importShortlist = false;
						window.location.reload();
					} else {
						this.showMessage(response.message,'danger');
					}	
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
		async copyShortList() {
			try {
				if(this.selectedUsers) {
					const response = await copyShortListUser(this.selectedUsers,this.user.userName);
					if (response.data && !(response.data.hasErrors)) {
						this.showMessage(response.data.message,'success');
						this.copyUser = false;
						this.selectedUsers = [];
					} else {
						this.showMessage(response.message,'danger');
					}	
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't copy",'danger');
			}
		},
	},
  created(){
    this.isLoggedIn = isLoggedIn() ? true : false;
		const user = JSON.parse(getUser());
		this.user = user;
		this.getUsers();
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
.margin-top-12{
  margin-top: 7px;
}
@import'~bootstrap/dist/css/bootstrap.css'
</style>