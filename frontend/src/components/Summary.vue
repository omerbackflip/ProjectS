<template>
<div class="main-container">

	<div v-if="summary && summary.length" class="summary-wrapper">
		<v-container>
		<!-- <template> -->
			<!-- <v-simple-table dense>
				<template v-slot:default>
					<thead>
						<tr>
							<th class="text-left">Total</th>
							<th class="text-left">Description</th>
							<th class="text-left">ID</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in summary" :key="item.itemId">
							<td class="text-right">{{ (user.discount*item.total).toLocaleString() }}</td>
							<td class="text-right">{{ item.description }}</td>
							<td>{{ item.itemId  }}</td>
						</tr>
					</tbody>
				</template>
			</v-simple-table> -->
			<v-layout row wrap justify-space-around>
      			<v-flex xs12 md5>
					<v-data-table 
						:headers="headers1"
						:items="summary"
						disable-pagination
						bordered
						height="81vh"
						fixed-header
						hide-default-footer
						>
					</v-data-table>
				</v-flex>
				<v-flex xs12 md5>
					<v-data-table 
						:headers="headers2"
						:items="summary"
						disable-pagination
						bordered
						height="81vh"
						fixed-header
						hide-default-footer
						>
					</v-data-table>
				</v-flex>
			</v-layout>
		<!-- </template> -->
		</v-container>

	</div>
	<div class="grand-total mt-3 ml-3">
		<strong>Grand Total = {{ (user.discount*grandTotal).toLocaleString() }}</strong>
	</div>
</div>
</template>

<script>
import { getSummary } from '../api';
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
			headers1:[
				{text:'total', 			value:'total', 		class: 'hdr-styles'},
				{text:'description', 	value:'description',class: 'hdr-styles'},
				{text:'ID',				value:'itemId',		class: 'hdr-styles'},
			],
			headers2:[
				{text:'total', 	value:'total',	class: 'hdr-styles'},
				{text:'Topic', 	value:'topic',	class: 'hdr-styles'},
			],
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
	},
	async created(){
		this.user = JSON.parse(await getUser());
		this.getSummary();
	},

	numberWithCommas(x) { // not used ...
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
},

}
</script>

<style scoped>
td{
	border-left: 1px solid #ececec;
}

</style>