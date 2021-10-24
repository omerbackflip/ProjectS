<template>
<div class="main-container">

	<div v-if="summary && summary.length" class="summary-wrapper">

		<template>
			<v-simple-table dense>
				<template v-slot:default>
				<thead>
					<tr>
						<th class="text-left">
							Total
						</th>
						<th class="text-left">
							Description
						</th>
						<th class="text-left">
							ID
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
					v-for="item in summary"
					:key="item.itemId"
					>
						<td class="text-right">{{ item.total.toLocaleString() }}</td>
						<td class="text-right">{{ item.description }}</td>
						<td>{{ item.itemId  }}</td>
					</tr>
				</tbody>
				</template>
			</v-simple-table>
			</template>

	</div>
			<div class="grand-total mt-3 ml-3">
				<strong>Grand Total = {{grandTotal.toLocaleString()}}</strong>
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
	}
}
</script>

<style scoped>
td{
	border-left: 1px solid #ececec;
}

</style>