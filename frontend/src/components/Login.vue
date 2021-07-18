<template>
    <div class="global-container">
	<div class="card login-form">
        <div class="alert alert-danger m-4" v-if="message">
            {{message}}
        </div>
    
	<div class="card-body">

		<h3 class="card-title text-center">LOG IN</h3>
		<div class="card-text">
			<form @submit="login($event)">
				<div class="form-group">
					<label for="exampleInputEmail1">Username</label>
					<input name="username" v-model="username" class="form-control form-control-sm">
				</div>
				<div class="form-group mt-4">
					<label for="exampleInputPassword1">Password</label>
					<input name="password" v-model="password" type="password" class="form-control form-control-sm" id="exampleInputPassword1">
				</div>
				<button type="submit" class="btn btn-primary btn-block">Sign in</button>				
			</form>
		</div>
	</div>
</div>
</div>
</template>

<script>
import {authLogin} from '../api/index';
import {setAuthToken} from '../api/client';
import {isLoggedIn, setSession , setUser} from '../data/utils';

export default {
	name: 'Login',
	data() {
		return {
			username:'',
			password: '',
			message: '',
		}
	},
	methods: {
		async login(e) {
			try{
				e.preventDefault();
				if(this.username && this.password) {
					const response = await authLogin(this.username,this.password);
					if(response.data && !(response.data.hasErrors)) {
						setAuthToken(response.data.result.token);
						setSession(response.data.result.token);
						setUser(JSON.stringify(response.data.result.user));	
						window.location.reload();
					} else {
						this.showError(response.data.errorModel.message);
					}
				} else {
					this.showError('Username or password cannot be empty!');
				}	
			}
			catch (error) {
				this.showError((error.error && error.error.errorModel && error.error.errorModel.message) || "Something Went Wrong!");			
			}
		},
		showError(message) {
			this.message = message;
			setTimeout(() => {
				this.message = '';			
			}, 3000);
		}
	},
	created() {
		if(isLoggedIn()) {
			this.$router.push('/payable-items-list');
		}
	}
}
</script>

<style scoped>
html,body { 
	height: 100%; 
}

.global-container{
	height:100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

form{
	padding-top: 10px;
	font-size: 14px;
	margin-top: 30px;
}

.card-title{ font-weight:300; }

.btn{
	font-size: 14px;
	margin-top:20px;
}


.login-form{ 
	width:330px;
	margin:20px;
}

.sign-up{
	text-align:center;
	padding:20px 0 0;
}

.alert{
	margin-bottom:-30px;
	font-size: 13px;
	margin-top:20px;
}
</style>