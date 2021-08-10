<template>
<div class="container">
	<h2>Users</h2>
	<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert mt-4 mb-4" v-if="message">
		{{message}}
	</div>
	<div v-if="user.rootUser">
		<button @click="openForm = !openForm" class="btn btn-success mt-2 mb-2">
			Create User
		</button>
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

	  <md-table v-model="users" md-sort="name" md-sort-order="asc" md-card>
		<md-table-row>
			<md-table-head>Username</md-table-head>
			<md-table-head>First Name</md-table-head>
			<md-table-head>Last Name</md-table-head>
			<md-table-head>Root User</md-table-head>
			<md-table-head>Date Created</md-table-head>
			<md-table-head v-if="user.rootUser">Controls</md-table-head>
		</md-table-row>

		<md-table-row slot="md-table-row" :key="userData.userName" v-for="userData of users">
			<md-table-cell>{{userData.userName}}</md-table-cell>
			<md-table-cell>{{userData.firstName}}</md-table-cell>
			<md-table-cell>{{userData.lastName}}</md-table-cell>
			<md-table-cell>{{userData.rootUser ? 'Yes' : 'No'}}</md-table-cell>
			<md-table-cell>{{userData.createdAt | formatDate}}</md-table-cell>
			<md-table-cell v-if="user.rootUser">
				<div class="row">
					<div class="col" @click="()=> deleteUser(userData._id)">
						<md-icon class="control-icon">
							delete
						</md-icon>
					</div>
					<div class="col" @click="() => editUser(userData)">
						<md-icon  class="control-icon">
							edit
						</md-icon>
					</div>
				</div>
			</md-table-cell>
		</md-table-row>

    </md-table>

</div>
</template>

<script>
import { getAllUsers,createUser , updateUserById , deleteUserById } from '../api';
import {getUser} from '../data/utils';
import Vue from 'vue';
import moment from 'moment';

Vue.filter('formatDate', function(value) {
    if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
    }
});

export default {
	name: 'Users',
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
		editUser(user) {
			this.openForm = true;
			this.newUser = user;
			this.editMode = true;
		},
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