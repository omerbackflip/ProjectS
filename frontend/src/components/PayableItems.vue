<template>
<div class="main-container">
	<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
        {{message}}
    </div>
	<template >
		<!-- <el-aside width="200px">
			<el-menu>
    		  <el-submenu :key="page.itemId+Math.floor(Math.random() * 1548) + index" v-for="(page,index) of idPrefixes" :index="String(index)">
				<template #title>
					<span @click="onPageChange(page.itemId)">{{page.itemId+'-'+page.description}} </span>
				</template>
				
				<el-menu-item-group :key="page.itemId+index+Math.floor(Math.random() * 1228)" v-for="(element,index) of page.subItems">
					<el-menu-item
					 :index="String(index)"
					 v-bind:class="{'bg-blue':  element.itemId.length === 5 }" 
					 @click="()=>onPageChange(element.itemId)"
					 >
	 				{{element.itemId}}
					</el-menu-item>					
				</el-menu-item-group>

			</el-submenu>
			</el-menu>
		</el-aside> -->

			<!-- <el-header>
					<main-header
						title="Payable Items List"
						:payable="true"
						@loadList="loadPayableItems"
						:itemIds="itemIds"
						@addList="addToShortList"
					></main-header>
			</el-header> -->

					<template  v-if="!isLoading && payableItems">
						<v-simple-table class="mt-2" border dense>
							<template v-slot:default>
							<thead>
								<tr>
									<th class="text-left"> ID </th>
									<th class="text-left"> Description</th>
									<th class="text-left"> Unit </th>
									<th class="text-left"> Price </th>
									<th class="text-left"> Add to Paka </th>
								</tr>
							</thead>
							<tbody>
								<tr
								v-for="item in payableItems"
								:key="item.itemId"
								>
									<td v-bind:class="{'bg-green': item.added,'area-wrapper': item.itemId.length === 2, 'sub-area-wrapper':  item.itemId.length === 5 }">
										{{ item.itemId }}
									</td>
									<td v-bind:class="{'bg-green': item.added,'area-wrapper': item.itemId.length === 2, 'sub-area-wrapper':  item.itemId.length === 5 }">
										{{ item.description }}
									</td>
									<td v-bind:class="{'bg-green': item.added,'area-wrapper': item.itemId.length === 2, 'sub-area-wrapper':  item.itemId.length === 5 }">
										{{ item.unit }}
									</td>
									<td v-bind:class="{'bg-green': item.added,'area-wrapper': item.itemId.length === 2, 'sub-area-wrapper':  item.itemId.length === 5 }">
										{{ item.price }}
									</td>

									<td  v-if="!(item.added) && !(item.unit === 'הערה')">
										<el-checkbox size="small"
										:checked="itemIds.includes(item.itemId)" v-if="item.itemId.length === 10" @change="addToList(item.itemId)" type="checkbox" 
											style="text-align:center"
											controls-position="right">
										</el-checkbox>
									</td>

									<span class="bg-green" v-else-if="(item.added)">
										<p v-if="item.itemId.length === 10">{{item.amount}}</p>
									</span>				
								
									<span class="bg-green" v-else-if="item.unit === 'הערה' && !(item.added)">
										<p v-if="item.itemId.length === 10"></p>
									</span>	
									
								</tr>
							</tbody>
							</template>
						</v-simple-table>
						</template>

	</template>

	<div v-if="!(payableItems.length) && !isLoading" class="mt-3 mb-4 text-center alert alert-warning container">
		No Data has been imported!
	</div>

	<template v-if="isLoading">
		<md-progress-spinner></md-progress-spinner>
	</template>

</div>
</template>

<script>
import { getAllPayableItems,addShortListItems } from '../api';
import Paging from './Paging.vue';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';

export default {
	name: 'Payable-Items',
	components: {
		Paging,
		MainHeader
	},
	data() {
		return {
			payableItems : [],
			idPrefixes: [],
			idPrefix: '01',
			keyword:'',
			isLoading : false,
			file: '',
			message: '',
			messageType: 'danger',
			itemIds: [],
			user: {},
		}
	},
	methods: {
		//load all payable items list
		async loadPayableItems(key) {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName
				};
				if(!(this.keyword || key)) {
					params['itemId'] = this.idPrefix;
				} else {
					params['keyword'] = this.keyword || key;
				}
				const response = await getAllPayableItems(params);
				if (response.data) {
					this.payableItems = response.data.result;
					this.idPrefixes = response.data.idPrefixes;
				}
				this.isLoading = false;
			} catch (error) {
				console.log(error);
				this.isLoading = false;
			}
		},
		//used to add items to short list
		async addToShortList() {
			try {
				if(this.itemIds && this.itemIds.length) {
					const body = {
						userName: this.user.userName,
						itemIds: this.itemIds
					};
					const response = await addShortListItems(body);
					if (response.data && !(response.data.hasErrors)) {
						this.message = response.data.message;
						this.messageType = 'success';
						setTimeout(() => this.message = '', 4000);	
					}	
				}
			} catch (error) {
				console.log(error);
			}
		},		
		addToList(id){
			const index = this.itemIds.indexOf(id);
			if(index < 0) {
				this.itemIds.push(id);
			} else {
				this.itemIds.splice(index,1);
			}
		},
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
		},
		//pagination handler
		onPageChange(page) {
			this.idPrefix = page;
			this.loadPayableItems();
		},
		changeSize(e){
			this.size = e.target.value;
			this.loadPayableItems();
		},
	},
	created(){
		const user = JSON.parse(getUser());
		this.user = user;
		this.loadPayableItems();
	}
}
</script>

<style scoped>
.area-wrapper{
    border: 1px solid yellow;
    background: yellow;
}

.sub-area-wrapper{
    border: 1px solid blue;
    background: blue;
    color: #FFF;
}

.md-cell {
    border-left: 1px solid #e0e0e0;
    padding-left: 10px;
}

.md-header-cell{
    border-left: 1px solid #e0e0e0;
    padding-left: 10px;
}

.md-column-description {
    max-width: 200px;
	text-align: right !important;
}

.filters-container{
    background: #ececec;
    border-radius: 12px;
    float: right;
    width: 70%;
    padding: 15px 30px 15px 30px;
}

.add-item{
    width: 160px;
    text-align: center;
}

.checkbox-item{
    text-align: center;
}

.align-button{
    text-align-last: right;
}

td{
  text-align: -webkit-left;
  border-left: 1px solid #ececec;
}
.el-table td{
	text-align: -webkit-right !important;
}

.page-select{
	width: 23% !important;
}

.item-wrapper{
	border: 1px solid #ececec;
    padding: 5px;
    font-size: 10px;
}


.item-decoration{
	text-decoration: none;
	cursor: pointer;
	margin-bottom: 4px;
	color: black;
}
.bg-yellow{
	color: yellow !important;
}

.bg-blue{
	color: blue !important;
}
.bg-green{
	background-color: lightgreen !important;
}


</style>