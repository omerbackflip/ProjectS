
<template>
	<span>
		<v-card
			class="mx-auto"
			height="auto"
			v-if="isLoggedIn"
		>
			<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
				{{message}}
			</div>

			<template v-if="isLoggedIn" class="row ml-4 navigation text-center">
				<v-app-bar  class="app-bar overflow-scroll">
					<span @click="drawer = true">
						<md-icon class="cursor-pointer text-white mr-3">menu</md-icon>
					</span>
					<v-toolbar-title class="title-dashboard">Dashboard</v-toolbar-title>

					<v-toolbar-items class="hidden-sm-and-down ml-4">
						<template v-for="route of routes">
							<template  v-if="!(route.children.length)">
								<v-btn :key="route.id" text @click="redirect(route.path)">
									<md-icon class="text-white">{{route.icon}}</md-icon>
									<span class="div-text text-white font-weight-bold">{{route.title}}</span>
								</v-btn>
							</template>

							<template v-if="route.children.length">
								<v-menu :key="route.id" data-app :rounded="true" open-on-hover offset-y transition="slide-x-transition" bottom right>
									<template v-slot:activator="{ on, attrs }">
										<v-btn text v-bind="attrs" v-on="on">
											<md-icon class="text-white">{{route.icon}}</md-icon>
											<span class="div-text text-white font-weight-bold">{{route.title}}</span>
										</v-btn>
									</template>
									<v-list dense>
										<v-list-item v-for="(child, index) of route.children" :key="index" router @click="navigateTo(child)">
										<v-list-item-action>
												<v-list-item-title>{{ child.title }}</v-list-item-title>
											</v-list-item-action>
										</v-list-item>
									</v-list>
								</v-menu>
							</template>
						</template>
					</v-toolbar-items>


					<div class="flex-grow-1"></div>

					<v-toolbar-items>

					<!-- Add Short List Items button -->
						<v-btn
							v-show="itemIds.length"
							@click="addToShortList"
							class=mx-2 plus-button
							text
							>
							<span class="text-white plus-icon">
								+
							</span>
						</v-btn>

						<!-- Toggle search button -->
						<v-btn
							text
							v-show="showSearch"
							@click="loadListItems"
							>
							<md-icon>
								search
							</md-icon>
						</v-btn>

						<!-- Create User button -->
						<v-btn
							v-if="showCreateUser"
							@click="createUser"
							class=mx-2 plus-button
							text
							>
							<md-icon>
								person_add
							</md-icon>
						</v-btn>
						
						<v-btn class="user-icon" text v-if="isLoggedIn">
							<md-icon class="text-white">person</md-icon>
							<span class="text-white">
								{{user.userName}}
							</span>
						</v-btn>
						
						<v-btn text v-if="isLoggedIn" @click="logoutApp()">
							<md-icon class="cursor-pointer ml-5 text-white" >logout</md-icon>
						</v-btn>
					</v-toolbar-items>
										
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

				<v-dialog
						transition="dialog-top-transition"
						max-width="600"
						max-height="400"
						v-model="importPayable"
				>
						<template>
							<v-card>
							<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
								{{message}}
							</div>
								<v-toolbar
								color="primary"
								>Import payable items</v-toolbar>
								<v-card-text>
									<div class="row mt-4">
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
								</v-card-text>
								<v-card-actions class="justify-end">
								<v-btn
									text
									class="mt-2 mb-2 btn btn-success text-white"
									:disabled="disableFileUpload || !file" @click = "importPayableItemsData()" 
								>Import Data</v-btn>
								</v-card-actions>
							</v-card>
						</template>
					</v-dialog>



				<!-- Import short listed items -->

				<v-dialog
						transition="dialog-top-transition"
						max-width="600"
						max-height="400"
						v-model="importShortlist"
				>
						<template>
							<v-card>
								<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
									{{message}}
								</div>
								<v-toolbar
								color="primary"
								>Import Short List items</v-toolbar>
								<v-card-text>
								<input 
									@change="onShortListFileSelect($event)" 
									id="fileSelect" 
									class="mt-4"
									ref="fileInput"
									type="file" 
									accept=".xlsx, application/vnd.openxmlformds-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
								/>
								</v-card-text>
								<v-card-actions class="justify-end">
								<v-btn
									text
									class="mt-2 mb-2 btn btn-success text-white"
									@click = "shortListItems()"
								>Short List</v-btn>
								</v-card-actions>
							</v-card>
						</template>
					</v-dialog>

				<!-- Copy short list items -->

				  <v-dialog
						transition="dialog-top-transition"
						max-width="600"
						max-height="600"
						v-model="copyUser"
				>
						<template>
							<v-card>
								<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
									{{message}}
								</div>
								<v-toolbar
								color="primary"
								>Copy Items</v-toolbar>
								<v-card-text>
									<v-select
										v-model="selectedUsers"
										:items="getUsersToShow()"
										chips
										class="mt-4 mb-4"
										label="Chips"
										multiple
										outlined
									></v-select>
								</v-card-text>
								<v-card-actions class="justify-end">
								<v-btn
									text
									class="dialog-button-height"
									footer
									bottom
									:disabled="!(selectedUsers.length)" @click = "copyShortList()"
								>Submit</v-btn>
								</v-card-actions>
							</v-card>
						</template>
					</v-dialog>

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
		//used to import for payable items
		async importPayableItemsData(){
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
				if(this.selectedUsers && this.selectedUsers.length) {
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
		getUsersToShow(){
			return this.users.map(user => `${user.userName}`)
		}
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
    border: 1px solid;
    border-radius: 100%;
    padding: 4px 12px 4px 12px;
  }

  .plus-button{
	  background: transparent !important;
	  height: 50px !important;
	  width: 50px !important;
  }

  .margin-top-log{
	  margin-top: 15px;
  }
  
  .user-icon{
	  text-transform: inherit;
  }

  @media screen and (max-width: 968px) {
	  button{
		  font-size: 8px !important;
	  }
	  .title-dashboard{
		  display: none;
	  }
  }

  .user-icon:hover{
	  background: #1867c0 !important;
  }

  .v-dialog > .v-card {
	  height: 400px;
  }

  .dialog-button-height{
	position: relative;
    bottom: 0;
    top: 260px;
	color:#FFF !important;
	background: #1867c0 !important;
  }

@import'~bootstrap/dist/css/bootstrap.css'
</style>