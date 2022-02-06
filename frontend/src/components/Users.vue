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

			<label class="mt-2 mb-2">Discount</label>
			<input name="discount" v-model="newUser.discount" class="form-control"/>

			<label class="mt-2 mb-2">Password</label>
			<input type="password" v-if="!editMode"
			v-model="newUser.password" autocomplete="off" class="form-control"/>

			<input v-if="editMode" placeholder='Leave empty if not changed' type="password" 
			v-model="updatedPassword" autocomplete="off" class="form-control"/>

			<label class="mt-2 mb-2 mr-3 ml-3">Root user</label>
			<input name="rootUser" v-model="newUser.rootUser" class="ml-3" type="checkbox"/>
		</div>
		<v-btn type="submit" class="btn btn-success">
			{{editMode ? 'Update' : 'Submit'}}
		</v-btn>
		<v-btn @click="closeForm($event)" class="btn btn-success ml-3">
			Cancel
		</v-btn>
	</form>

	<v-data-table 
		:headers="headers"
		:items="users"
		disable-pagination
		disable-sort
		bordered
		height="91vh"
		fixed-header
		hide-default-footer

	>
		<template v-slot:[`item.edit`]="{ item }">
			<span @click="() => editUser(item)">
				<md-icon  class="control-icon">
					edit
				</md-icon>
			</span>				
		</template>		
		
		<template v-slot:[`item.delete`]="{ item }">
			<span @click="()=> deleteUser(item._id)">
				<md-icon class="control-icon">
					delete
				</md-icon>
			</span>
		</template>		

	</v-data-table>
</div>

</template>

<script>
import { getAllUsers,createUser , updateUserById , deleteUserById } from '../api';
import {getUser} from '../data/utils';
import Vue from 'vue';
import MainHeader from './MainHeader.vue';

Vue.filter('formatDate', function(value) {
    if (value) {
        return String(value)
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
			headers:[
				{text:'Username', 		value:'userName'},
				{text:'First Name', 	value:'firstName'},
				{text:'Last Name',		value:'lastName'},
				{text:'Discount',		value:'discount'},
				{text:'Root User',		value:'rootUser'},
				{text:'Date Created',	value:'createdAt'},
				{text:'EDIT',			value:'edit'},
				{text:'DEL',			value:'delete'},
			],
			newUser : {
				userName: '',
				firstName: '',
				lastName: '',
				discount: '',
				password: '',
				rootUser: false,
			},
			currentUsername: '',
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
				e.preventDefault(); // prevent the form from submitting
				const {userName , firstName , lastName , password, discount} = this.newUser;
				if(userName && firstName && lastName && password && discount){
					let response;
					if(this.editMode) {
						delete this.newUser.password;
						if(this.updatedPassword) {
							this.newUser.password = this.updatedPassword;
						}
						response = await updateUserById({...this.newUser,currentUsername: this.currentUsername});
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
							discount: '',
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
		closeForm(e) {
			e.preventDefault(); // prevent the form from submitting
			this.openForm=false;
		},
		toggleCreateUser() {
			this.openForm = !this.openForm;
		},

		//edit user form open
		editUser(user) {
			this.openForm = true;
			this.currentUsername = user.userName,
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