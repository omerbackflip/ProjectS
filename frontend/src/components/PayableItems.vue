<template>
<div class="main-container">
	<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
        {{message}}
    </div>
	<template >
		<div v-if="showSearch" class="search-wrapper d-flex mr-3">
			<input v-model="keyword" class="form-control form-control-sm mt-2 mb-2 ml-4" type="text" placeholder="חפש מילים מסויימיות..." style="width:auto">
			<button @click="loadListItems" class="btn btn-success btn-sm mt-2 mb-2 ml-2">
				Search
			</button>
		</div>
		<template  v-if="!isLoading && payableItems">
			<v-data-table 
				:headers="headers"
				:items="payableItems"
				disable-pagination
				disable-sort
				bordered
				height="91vh"
				fixed-header
				hide-default-footer
				:item-class="itemRowBackground"
			>

				<template v-slot:[`item.price`]="{ item }">
					{{item.price ? item.price.toLocaleString() : "" }}
				</template>

				<template class="dir-rtl text-right" v-slot:[`item.description`]="{ item }">
					{{item.description.substr(12,300)}}
				</template>

				<template v-slot:[`item.add_to_paka`]="{ item }">
					<td  v-if="!(item.added) && !(item.unit === 'הערה')">
						<input
							:checked="itemIds.includes(item.itemId)" 
							v-if="item.itemId.length === 10" 
							@change="addToList(item.itemId)" 
							style="text-align:center"
							type="checkbox"
							class="cursor-pointer"
						>
					</td>

					<td v-else-if="(item.added)">
						<p v-if="item.itemId.length === 10">{{item.amount}}</p>
					</td>				
				
					<td v-else-if="item.unit === 'הערה' && !(item.added)">
						<p v-if="item.itemId.length === 10"></p>
					</td>	
				</template>


			</v-data-table>
		</template>
	</template>

	<div style="position:static" v-if="!(payableItems.length) && !isLoading" class="mt-3 mb-4 text-center alert alert-warning container">
		No Data has been imported!
	</div>

	<template v-if="isLoading">
		<md-progress-spinner></md-progress-spinner>
	</template>
</div>

</template>

<script>
import { getAllPayableItems,addShortListItems } from '../api';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';

export default {
	name: 'Payable-Items',
	components: {
		MainHeader
	},
	data() {
		return {
			payableItems : [],
			keyword:'',
			isLoading : false,
			file: '',
			showSearch: false,
			message: '',
			messageType: 'danger',
			currentPage: 0,
			itemIds: [],
			user: {},
			headers:[
				{text:'ID', 			value:'itemId'},
				{text:'DESCRIPTION', 	value:'description', align:'right', rtl: true, class: 'success title'},
				{text:'UNIT',			value:'unit'},
				{text:'PRICE',			value:'price'},
				{text:'ADD_TO_PAKA',	value:'add_to_paka'},
			],
		}
	},
	methods: {
		//load all payable items list
		async loadPayableItems(page,keyword) {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName
				};
				if(page) {
					params['itemId'] = page;
					this.currentPage = page; // Save current page in order to stay in the current page
				} else if(keyword){
					params['keyword'] = this.keyword;
				} else {
					params['itemId'] = "01";
				}
				const response = await getAllPayableItems(params);
				if (response.data) {
					this.payableItems = response.data.result;
					this.$emit('getData', response.data.idPrefixes);
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
						this.loadPayableItems(this.currentPage);
						setTimeout(() => this.message = '', 4000);	
					}	
				}
			} catch (error) {
				console.log(error);
			}
		},		

		//Background of row if added, area or sub area
		itemRowBackground(item) {
			return item.added ? 'bg-green' : item.itemId.length === 2 ? 'area-wrapper' : item.itemId.length === 5 ? 'sub-area-wrapper' : '';
		},	
		//Toggle main top search button function
		toggleSearch(){
			this.showSearch = !this.showSearch;
		},
		//to load this function when search keyword is entered
		loadListItems(){
			this.loadPayableItems(0,this.keyword);
		},
		//add to short list function
		addToList(id){
			//getting index if the item is already pushed in itemIds
			const index = this.itemIds.indexOf(id);
			//if not pushed, push it
			if(index < 0) {
				this.itemIds.push(id);
			} else {
				//else remove it
				this.itemIds.splice(index,1);
			}
			this.$emit('getCheckedItems',this.itemIds)
		},
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
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

<style>

.area-wrapper{
    border: 1px solid yellow;
    background: yellow !important;
}

.sub-area-wrapper{
    border: 1px solid blue;
    background: blue !important;
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

 tr :nth-child(1) {
	direction: rtl !important;
}

.v-data-table__wrapper{
	overflow-x: hidden !important;
}

.text-right{
	direction: rtl !important;
}

</style>