<template>
<div class="main-container">
	<div v-if="summaryIDs && summaryIDs.length" class="summary-wrapper">
		<v-container>
			<v-layout class="justify-content-space-between" row wrap >
      			<v-flex xs12 md6>
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
						<template v-slot:[`item.planned`]="{ item }">
							{{ item.planned ? (item.planned).toLocaleString(undefined,{maximumFractionDigits: 0}) : '' }}
						</template>
						<template v-slot:[`item.description`]="{ item }">
							<!-- <Topic v-bind:itemId="item.itemId" v-bind:topic="item.description" v-bind:total="item.total" v-bind:user="user" /> -->
							<Topic 	v-bind:itemId="item.itemId" 
									v-bind:header=" item.description+
													(item.total ? ' - '+item.total.toLocaleString(undefined,{maximumFractionDigits: 0}) : '' )" 
									v-bind:user="user" />
						</template>	
					</v-data-table>
					<div class="grand-total mt-3 ml-3">
						<strong>
						 	Planned  = 	{{ (grandTotalPlanned).toLocaleString(undefined,{maximumFractionDigits: 0}) }} ---------
							Current = 	{{ (grandTotalIDs).toLocaleString(undefined,{maximumFractionDigits: 0}) }} --------- 
						 	Approved = 	{{ (grandTotalPaid).toLocaleString(undefined,{maximumFractionDigits: 0}) }}
						</strong>
					</div>
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
						@click:row="rowClicked"
						dense>
						<template v-slot:[`item.total`]="{ item }">
							{{ item.total ? (item.total).toLocaleString(undefined,{maximumFractionDigits: 0}) : '' }}
						</template>
						<template v-slot:[`item.topic`]="{ item }">
							<Topic 	v-bind:topic="item.topic" 
									v-bind:header="item.total.toLocaleString(undefined,{maximumFractionDigits: 0}) + ' - ' + item.topic" 
									v-bind:user="user" />
						</template>	
					</v-data-table>
					<div class="grand-total mt-3 ml-3">
						<strong>Total for Topics = {{ (grandTotalTopics).toLocaleString(undefined,{maximumFractionDigits: 0}) }}</strong>
					</div>
				</v-flex>
			</v-layout>
		</v-container>
	</div>
</div>
</template>

<script>
import { getSummary } from '../api';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';
import Topic from './Topic.vue';

export default {
	name: 'Summary',
	components: {
		MainHeader,
		Topic,
	},
	data() {
		return {
			summaryIDs: [],
			summaryTopics: [],
			user: {},
			grandTotalIDs:0,
			grandTotalPaid:0,
			grandTotalPlanned:0,
			grandTotalTopics:0,
			headersID:[
				{text:'Total', 			value:'total', 		class: 'hdr-styles'},
				{text:'Approved',		value:'paid',		class: 'hdr-styles'},
				{text:'Planned', 		value:'planned',	class: 'hdr-styles'},
				{text:'Description', 	value:'description',class: 'hdr-styles', align:'right'},
				{text:'ID',				value:'itemId',		class: 'hdr-styles'},
			],
			headersTopics:[
				{text:'Total', 	value:'total',	class: 'hdr-styles', align:'right'},
				{text:'Count', 	value:'count',	class: 'hdr-styles', align:'right'},
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
					this.grandTotalPaid = response.data.grandTotalPaid;
					this.grandTotalPlanned = response.data.grandTotalPlanned;
					//--------- Topics
					this.summaryTopics = response.data.summaryTopics.filter((item) => {
						return (item.topic != null && item.topic != "")
					});
					this.grandTotalTopics = response.data.grandTotalTopics;
				} 		
			} catch (error) {
				console.log(error);
			}
		},
		rowClicked (row){
			console.log(row)
			//this.$router.push({ name: "Users", params: { row: row } });
		}
	},
	async created(){
		this.user = JSON.parse(getUser());
		//console.log(this.user)
		this.getSummary();
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