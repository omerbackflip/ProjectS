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
		<div class="grand-total mt-3 ml-3">
			<strong>Grand Total = {{grandTotal}}</strong>
		</div>
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
			grandTotal:0,
		}
	},
	methods: {
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
	},
	async created(){
		this.user = JSON.parse(await getUser());
		this.getSummary();
	}
}
</script>

<style scoped>
td{
	border-left: 1px solid #ececec;
}

</style>