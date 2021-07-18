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
			<label class="mt-2 mb-2">Password name</label>
			<input type="password" name="password" v-model="newUser.password" class="form-control"/>
			<label class="mt-2 mb-2 mr-3 ml-3">Root user</label>
			<input name="rootUser" v-model="newUser.rootUser" class="ml-3" type="checkbox"/>
		</div>
		<button type="submit" class="btn btn-success">
			Submit
		</button>
	</form>

	  <md-table v-model="users" md-sort="name" md-sort-order="asc" md-card>
		<md-table-row>
			<md-table-head>Username</md-table-head>
			<md-table-head>First Name</md-table-head>
			<md-table-head>Last Name</md-table-head>
			<md-table-head>Root User</md-table-head>
			<md-table-head>Date Created</md-table-head>
		</md-table-row>

		<md-table-row slot="md-table-row" :key="user.userName" v-for="user of users">
			<md-table-cell>{{user.userName}}</md-table-cell>
			<md-table-cell>{{user.firstName}}</md-table-cell>
			<md-table-cell>{{user.lastName}}</md-table-cell>
			<md-table-cell>{{user.rootUser ? 'Yes' : 'No'}}</md-table-cell>
			<md-table-cell>{{user.createdAt | formatDate}}</md-table-cell>
		</md-table-row>

    </md-table>

</div>
</template>

<script>
import { getAllUsers,createUser } from '../api';
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
					const response = await createUser(this.newUser);
					if(response && !(response.hasErrors)) {
						this.message = "User successfully created!";
						this.messageType = "success";
						newUser = {
							userName: '',
							firstName: '',
							lastName: '',
							password: '',
							rootUser: false,
						}
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
</style>