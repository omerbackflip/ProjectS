
<template>
	<span>
	<v-card
		class="mx-auto"
		height="900"
		v-if="isLoggedIn"
	>
		<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
			{{message}}
		</div>

			<template v-if="isLoggedIn" class="row ml-4 navigation text-center">

			<v-app-bar class="app-bar overflow-scroll">
                <span @click="drawer = true">
                   <md-icon class="cursor-pointer text-white mr-3">menu</md-icon>
                </span>
 
                <v-toolbar-title>Dashboard</v-toolbar-title>

				<div class="mr-3 ml-2" :key="route.id" v-for="route of routes">
					<template v-if="!(route.children.length)">
						<div class="cursor-pointer col font-weight-bold text-decoration-underline ml-5 mr-2 text-white" @click="redirect(route.path)">
						<md-icon class="text-white">{{route.icon}}</md-icon>
						<span class="div-text">{{route.title}}</span>
						</div>
					</template>
					<template v-if="route.children.length">
						<div class="dropdown col">
						<button class="btn text-white font-weight-bold dropdown-toggle " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<md-icon class="text-white">{{route.icon}}</md-icon>
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
				<template >
					<div v-if="payable || shortList || userProp" class="row">
						<div v-if="user.rootUser && userProp">
							<button @click="openForm" class="btn btn-success mt-2 ml-4 mb-3">
								Create User
							</button>
						</div>
					</div>
				</template>

				<div class="row no-display">
					<div :class="(itemIds.length || showSearch || showCreateUser) ? 'margin-top-log' : ''" v-if="isLoggedIn" @click="logoutApp()">
						<md-icon class="cursor-pointer ml-5 text-white" >logout</md-icon>
					</div>
					<div class="ml-auto mr-2">
						<!-- Create User button -->
						<v-btn
							v-if="showCreateUser"
							@click="createUser"
							class=mx-2 plus-button
							fab
							>
							<md-icon class="plus-icon">
								person_add
							</md-icon>
						</v-btn>

						<!-- Add Short List Items button -->
						<v-btn
							v-show="itemIds.length"
							@click="addToShortList"
							class=mx-2 plus-button
							fab
							>
							<span class="plus-icon">
								+
							</span>
						</v-btn>

						<!-- Toggle search button -->
						<v-btn
							v-show="showSearch"
							@click="loadListItems"
							class=mx-2 plus-button
							fab
							>
							<md-icon class="plus-icon">
								search
							</md-icon>
						</v-btn>
						<md-icon class="text-white">person</md-icon>
						{{user.userName}}
					</div>
				</div>
			</v-app-bar>

			<v-navigation-drawer
                v-model="drawer"
                absolute
                temporary
              >
                <v-list
                  nav
                  dense
                >
                  <v-list-item-group
                    v-model="group"
                    active-class="deep-purple--text text--accent-4"
                  >

					<v-expansion-panels>
						<v-expansion-panel
							@click="onPageChange(page.itemId)" 
							:key="page.itemId+Math.floor(Math.random() * 1548) + index"
							v-for="(page,index) of idPrefixes"
						>
						<v-expansion-panel-header>
							{{page.itemId+'-'+page.description}}
						</v-expansion-panel-header>

						<v-expansion-panel-content>
							<v-list-item 
								@click="()=>onPageChange(element.itemId || element)" 
								v-bind:class="{'bg-blue':  element && element.itemId && element.itemId.length === 5, }"  
								:key="page.itemId+index+Math.floor(Math.random() * 1228)" 
								v-for="(element,index) of page.subItems"
						>
							<v-list-item-title  >
								{{element.itemId || element}}
							</v-list-item-title>
							</v-list-item>
						</v-expansion-panel-content>

						</v-expansion-panel>
					</v-expansion-panels>

                  </v-list-item-group>
                </v-list>
              </v-navigation-drawer>

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
            <router-view 
				@getData="getAreas"
				@getCheckedItems="getCheckedValues"
				ref="payableItems"
			/>
			</template>    		
          </v-card>
		  <template v-if="!isLoggedIn">
			<router-view/>
		  </template>
	</span>
</template>

<script>

import {routes} from '../data/routes.js';
import {
	logout,
	deletePayableItems,
	deleteShortListedItems,
	exportData,
	importDataFile,
	importShortListDataFile,
	getAllUsers,
	copyShortListUser
} from '../api/index.js';
import {isLoggedIn} from '../data/utils';
import {getUser} from '../data/utils';
import Login from '../components/Login.vue';

export default {
    name:"MainHeader",
	//Props used in the main header
	components: {
		Login
	},
	props: {
        title : String,
		payable: Boolean,
		shortList: Boolean,
		userProp: Boolean,
    },	
	//data used in the main header component level
	data: () => ({
		menuVisible: false,
		routes: routes,
		keyword:'',
		isDataImported: false,
		isLoggedIn: isLoggedIn() ? true : false,
		importPayable: false,
		importShortlist: false,
		shortListFile: '',
		user : {},
		changedRoute:false,
		copyUser: false,
		itemIds: [],
		file: '',
		showSearch: false,
		showCreateUser: false,
		message: '',
		messageType: 'danger',
		users: [],
		idPrefix: '01',
		selectedUsers: [],
		messageType : 'danger',
		disableFileUpload : false,
		drawer: false,
	    group:null,
		idPrefixes: [],
	}),
	methods:{
		//logout API
		logoutApp(){
			logout();
			this.isLoggedIn = false;
			this.$router.push('login');
		},
		redirect(path){
			this.$router.push(path);
		},
		//Navigation or popups features as in the drop down
    navigateTo(child) {
	  this.changedRoute = true;
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
	getAreas(data) {
		if(!(this.idPrefixes && this.idPrefixes.length) || this.changedRoute ) {
			this.changedRoute = false;
			this.idPrefixes = data;
		} 
	},
	getCheckedValues(data) {
		this.itemIds = data;
	},
	//used to delete all payable items
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
		//used to emit parent add to short list
		addToShortList() {
			try {
				this.$refs.payableItems.addToShortList();
				this.itemIds = [];				
			} catch (error) {
				console.log(error);
			}		
		},
		//used to emit parent load list
		loadListItems() {
			if(this.$refs.payableItems && this.$refs.payableItems.toggleSearch){
				this.$refs.payableItems.toggleSearch();
			}
		},
		//used to emit user create form
		openForm() {
			this.$emit("create");
		},
		//used to delete all short lists
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
		//used to export short list excel
		async exportExcel(){
			try {
				window.open(`${exportData}?userName=${this.user.userName}`);	
			} catch (error) {
				console.log(error);
			}
		},
		//file handler
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
		//used to import short list file
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
		//short list file handler
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
		//used to check file extention for validity of excel
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
		},
		//used to get all users for the copy short list feature
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
		//pagination handler
		onPageChange(page,keyword='') {
			this.idPrefix = page;
			if(this.$refs.payableItems.loadPayableItems){
				this.$refs.payableItems.loadPayableItems(page,keyword);
			} else if(this.$refs.payableItems.loadShortListedItems) {
				this.$refs.payableItems.loadShortListedItems(page,keyword);
			}
		},
		//import short excel api call
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
		//copy short list api call
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
		createUser() {
			if(this.$refs.payableItems && this.$refs.payableItems.toggleCreateUser){
				this.$refs.payableItems.toggleCreateUser();
			}
		},
	},
  created(){
    	this.isLoggedIn = isLoggedIn() ? true : false;
		const user = JSON.parse(getUser());
		this.user = user;
		this.getUsers();
		this.showSearch = !(this.$route.name === 'Summary' || this.$route.name === 'Users');
		this.showCreateUser = this.$route.name === 'Users';
  },
    watch: {
		'$route': function(to, from) {
			this.showSearch = !(this.$route.name === 'Summary' || this.$route.name === 'Users');
			this.showCreateUser = this.$route.name === 'Users';
		}
	}
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
  margin-top: 9px;
}
.toolbar-wrapper{
    background-color:#B3C0D1 !important;
    height: 52px;
}
.align-button{
    text-align-last: right;
}
.app-bar{
	background: #1867c0 !important;
	color: white !important;
}

.bg-yellow{
	color: yellow !important;
}

.bg-blue{
	color: blue !important;
}

  @media only screen and (max-width: 768px) {
	  .no-display{
		  display: none;
	  }
	  .overflow-scroll{
		  overflow-x:scroll;
	  }
  }

  .plus-icon{
	  font-size: 30px;
	  color: #000;
  }

  .plus-button{
	  background: transparent !important;
	  height: 50px !important;
	  width: 50px !important;
  }

  .margin-top-log{
	  margin-top: 15px;
  }

@import'~bootstrap/dist/css/bootstrap.css'
</style>