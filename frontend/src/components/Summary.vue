<template>
<div class="main-container">
		<el-container>
		<el-aside width="200px" style="height:600px">
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
		</el-aside>

	  <el-container>
		<el-header>
			<main-header
				title="Summary"
			></main-header>
		</el-header>
	  <el-main>
	<div v-if="summary && summary.length" class="summary-wrapper">

	 <el-table :data="summary">
        <el-table-column prop="itemId" label="ID" width="140">
        </el-table-column>
        <el-table-column prop="description" label="Description" width="200">
        </el-table-column>
        <el-table-column prop="total" label="Total">
        </el-table-column>
      </el-table>

	</div>
		</el-main>
		<el-footer>
			<div class="grand-total mt-3 ml-3">
				<strong>Grand Total = {{grandTotal}}</strong>
			</div>

		</el-footer>
	</el-container>

	</el-container>
</div>
</template>

<script>
import { getSummary,getAllPayableItems } from '../api';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';

export default {
	name: 'Summary',
	components: {
		MainHeader
	},
	data() {
		return {
			summary: [],
			user: {},
			grandTotal:0,
			idPrefixes: [],
		}
	},
	methods: {
		//get summary from api
		async getSummary() {
			try {
				const response = await getSummary(this.user.userName);
				if(response.data) {
					this.summary = response.data.summary;
					this.grandTotal = response.data.grandTotal;
				} 		
			} catch (error) {
				console.log(error);
			}
		},
		async getPrefixes() {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName
				};
				const response = await getAllPayableItems(params);
				if (response.data) {
					this.idPrefixes = response.data.idPrefixes;
				}
			} catch (error) {
				console.log(error);
			}
		},
		onPageChange() {
			this.$router.push('/payable-items-list');
		},
	},
	async created(){
		this.user = JSON.parse(await getUser());
		this.getSummary();
		this.getPrefixes();
	}
}
</script>

<style scoped>
td{
	border-left: 1px solid #ececec;
}

</style>