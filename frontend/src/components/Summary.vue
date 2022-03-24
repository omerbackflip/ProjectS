<template>
<div class="main-container">

	<div v-if="summaryIDs && summaryIDs.length" class="summary-wrapper">
		<v-container>
			<v-layout class="justify-content-space-between" row wrap >
      			<v-flex xs12 md5>
					<v-data-table 
						:headers="headersID"
						:items="summaryIDs"
						disable-pagination
						bordered
						height="85vh"
						fixed-header
						hide-default-footer
						class="elevation-1"
						dense>
						<template v-slot:[`item.total`]="{ item }">
							{{ item.total ? (item.total).toLocaleString(undefined,{maximumFractionDigits: 0}) : '' }}
						</template>
						<template v-slot:[`item.paid`]="{ item }">
							{{ item.paid ? (item.paid).toLocaleString(undefined,{maximumFractionDigits: 0}) : '' }}
						</template>
					</v-data-table>
				</v-flex>
				
				<v-flex xs12 md5>
					<v-data-table 
						:headers="headersTopics"
						:items="summaryTopics"
						disable-pagination
						bordered
						height="85vh"
						fixed-header
						hide-default-footer
						class="elevation-1"
						dense>
						<template v-slot:[`item.total`]="{ item }">
							{{ item.total ? (item.total).toLocaleString(undefined,{maximumFractionDigits: 0}) : '' }}
						</template>
					</v-data-table>
				</v-flex>
			</v-layout>
		</v-container>

	</div>
	<div class="grand-total mt-3 ml-3">
		<strong>Grand Total = {{ (grandTotalIDs).toLocaleString(undefined,{maximumFractionDigits: 0}) }}</strong>
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
			summaryIDs: [],
			summaryTopics: [],
			user: {},
			grandTotalIDs:0,
			grandTotalTopics:0,
			headersID:[
				{text:'Total', 			value:'total', 		class: 'hdr-styles'},
				{text:'Paid',			value:'paid',		class: 'hdr-styles'},
				{text:'Description', 	value:'description',class: 'hdr-styles', align:'right'},
				{text:'ID',				value:'itemId',		class: 'hdr-styles'},
			],
			headersTopics:[
				{text:'Total', 	value:'total',	class: 'hdr-styles'},
				{text:'Topic', 	value:'topic',	class: 'hdr-styles', align:'right'},
			],
		}
	},
	methods: {
		//get summary from api
		async getSummary() {
			try {
				const response = await getSummary(this.user.userName,this.user.discount);
				if(response.data) {
					this.summaryIDs = response.data.summaryIDs;
					this.grandTotalIDs = response.data.grandTotalIDs;
					this.summaryTopics = response.data.summaryTopics;
					this.grandTotalTopics = response.data.grandTotalTopics;
				} 		
			} catch (error) {
				console.log(error);
			}
		},
	},
	async created(){
		this.user = JSON.parse(getUser());
		//console.log(this.user)
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

.justify-content-space-between{
	justify-content: space-between;
}

</style>