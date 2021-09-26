<template>
<div class="main-container">
	<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert mt-4 mb-4" v-if="message">
		{{message}}
	</div>

	<form @submit="createUser($event)" v-if="openForm" class="form mt-3 mb-3 user-form">
		<div class="form-group">
			<label>User name</label>
			<input name="userName" v-model="newUser.userName" class="form-control"/>
			<label class="mt-2 mb-2">First name</label>
			<input name="firstName" v-model="newUser.firstName" class="form-control"/>
			<label class="mt-2 mb-2">Last name</label>
			<input name="lastName" v-model="newUser.lastName" class="form-control"/>
			<label class="mt-2 mb-2">Password</label>

			<input type="password" v-if="!editMode"
			v-model="newUser.password" autocomplete="off" class="form-control"/>

			<input v-if="editMode" placeholder='Leave empty if not changed' type="password" 
			v-model="updatedPassword" autocomplete="off" class="form-control"/>

			<label class="mt-2 mb-2 mr-3 ml-3">Root user</label>
			<input name="rootUser" v-model="newUser.rootUser" class="ml-3" type="checkbox"/>
		</div>
		<button type="submit" class="btn btn-success">
			{{editMode ? 'Update' : 'Submit'}}
		</button>
	</form>

		<!-- <el-aside width="200px" style="height:600px">
			<el-menu>
    		  <el-submenu :key="page.itemId+Math.floor(Math.random() * 1548) + index" v-for="(page,index) of idPrefixes" :index="String(index)">
				<template #title>
					<span @click="onPageChange(page.itemId)">{{page.itemId+' '+page.description}} </span>
				</template>
				
				<el-menu-item-group :key="page.itemId+index+Math.floor(Math.random() * 1228)" v-for="(element,index) of page.subItems">
					<el-menu-item
					 :index="String(index)"
					 v-bind:class="{'bg-yellow':  element.itemId.length === 5 }" 
					 @click="()=>onPageChange(element.itemId)"
					 >
	 				{{element.itemId}}
					</el-menu-item>					
				</el-menu-item-group>

			</el-submenu>
			</el-menu>
		</el-aside> -->


		<!-- <el-header>
			<main-header
				title="Users"
				:userProp="true"
				@create="openForm = !openForm"
			></main-header>
		</el-header> -->

			<template>
			<v-simple-table dense>
				<template v-slot:default>
				<thead>
					<tr>
						<th class="text-left">
							Username
						</th>
						<th class="text-left">
							First Name
						</th>
						<th class="text-left">
							Last Name
						</th>
						<th class="text-left">
							Root User
						</th>

						<th class="text-left">
							Date Created
						</th>

						<th class="text-left">
							Controls
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
					v-for="item in users"
					:key="item.userName"
					>
					<td>{{ item.userName }}</td>
					<td>{{ item.firstName }}</td>
					<td>{{ item.lastName }}</td>
					<td>{{ item.rootUser }}</td>
					<td>{{ item.createdAt }}</td>
					<td>
						<template slot-scope="scope">
							<div class="row">
								<div class="col" @click="()=> deleteUser(scope.row._id)">
									<md-icon class="control-icon">
										delete
									</md-icon>
								</div>
								<div class="col" @click="() => editUser(scope.row)">
									<md-icon  class="control-icon">
										edit
									</md-icon>
								</div>
							</div>
						</template>
					</td>
					</tr>
				</tbody>
				</template>
			</v-simple-table>
			</template>

</div>
</template>

<script>
import { getAllUsers,createUser , updateUserById , deleteUserById } from '../api';
import {getUser} from '../data/utils';
import Vue from 'vue';
import moment from 'moment';
import MainHeader from './MainHeader.vue';

Vue.filter('formatDate', function(value) {
    if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
    }
});

export default {
	name: 'Users',
	components: {
		MainHeader
	},
	data() {
		return {
			users: [],
			user : {},
			openForm : false,
			newUser : {
				userName: '',
				firstName: '',
				lastName: '',
				password: '',
				rootUser: false,
			},
			updatedPassword: '',
			editMode: false,
			message : '',
			messageType : 'danger',
		}
	},
	methods: {
		//get all users to show in the list
		async getUsers() {
			try {
				const response = await getAllUsers();
				if(response.data && !(response.data.hasErrors)) {
					this.users = response.data.result.users;
				} 		
			} catch (error) {
				console.log(error);
			}
		},
		//used to create a user
		async createUser(e) {
			try {
				e.preventDefault();
				const {userName , firstName , lastName , password} = this.newUser;
				if(userName && firstName && lastName && password){
					let response;
					if(this.editMode) {
						delete this.newUser.password;
						if(this.updatedPassword) {
							this.newUser.password = this.updatedPassword;
						}
						response = await updateUserById(this.newUser);
					} else {
						response = await createUser(this.newUser);
					}
					if(response && !(response.hasErrors)) {
						this.message = "User successfully created/updated!";
						this.messageType = "success";
						this.newUser = {
							userName: '',
							firstName: '',
							lastName: '',
							password: '',
							rootUser: false,
						}
						this.editMode= false;
						this.openForm = false;
						this.updatedPassword = '';
						setTimeout(() => this.message = '', 4000);
						this.getUsers();		
					} 			
				} else {
					this.message = "Please fill all fields!";
					this.messageType = "danger";
					setTimeout(() => this.message = '', 4000);	
				}
			} catch (error) {
				console.log(error);
			}
		},
		toggleCreateUser() {
			this.openForm = !this.openForm;
		},
		onPageChange() {
			this.$router.push('/payable-items-list');
		},
		//edit user form open
		editUser(user) {
			this.openForm = true;
			this.newUser = user;
			this.editMode = true;
		},
		//used to delete a user from the DB
		async deleteUser(id){
			if(window.confirm("Are you sure you want to delete this user?")){
				const response = await deleteUserById(id);
				if(response && !(response.hasErrors)) {
					this.message = "User successfully deleted!";
					this.messageType = "success";
					this.getUsers();
				} else {
					this.message = "Coundn't delete user!";
					this.messageType = "danger";
				}
			}
	  }
	},
	created(){
		this.getUsers();
		this.user = JSON.parse(getUser());
	}
}
</script>

<style scoped>
.user-form{
    border: 20px solid #3f51b5;
    border-radius: 12px;
    padding: 25px;
}

td{
  text-align: -webkit-left;
}
.control-icon{
	cursor: pointer;
}
</style>