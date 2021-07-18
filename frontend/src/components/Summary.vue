<template>
<div class="container">
	<h2>Summary</h2>
	<div v-if="summary && summary.length" class="summary-wrapper">
		<md-table v-model="summary" md-sort="name" md-sort-order="asc" md-card>
			<md-table-row>
				<md-table-head>ID</md-table-head>
				<md-table-head>Description</md-table-head>
				<md-table-head>Total</md-table-head>
			</md-table-row>

			<md-table-row slot="md-table-row" :key="sum.itemId" v-for="sum of summary">
				<md-table-cell>{{sum.itemId}}</md-table-cell>
				<md-table-cell>{{sum.description}}</md-table-cell>
				<md-table-cell>{{sum.total}}</md-table-cell>
			</md-table-row>

		</md-table>
	</div>
</div>
</template>

<script>
import { getSummary } from '../api';
import {getUser} from '../data/utils';

export default {
	name: 'Summary',
	data() {
		return {
			summary: [],
			user: {},
		}
	},
	methods: {
		async getSummary() {
			try {
				const response = await getSummary({
					userName: this.user.userName
				});
				if(response.data) {
					this.summary = response.data;
				} 		
			} catch (error) {
				console.log(error);
			}
		},
	},
	created(){
		this.getSummary();
		this.user = JSON.parse(getUser());
	}
}
</script>

<style scoped>
td{
	border-left: 1px solid #ececec;
}

</style>