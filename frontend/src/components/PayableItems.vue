<template>
<div class="main-container">
	<div v-bind:class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
        {{message}}
    </div>
	<div class="row">
		<div class="col text-left">
			<h2>Payable Items</h2>
		</div>
		<div class="align-button col mr-4">
			<button @click="addToShortList()" class="btn btn-success float-right mb-2" :disabled="!(itemIds.length)" >
				Add Items
			</button>
		</div>
	</div>
	<template >
	<div class="row">
		<div class="col-md-2">
			<div  :key="page.itemId+Math.floor(Math.random() * 1548) + index" v-for="(page,index) of idPrefixes" class="text-center accordion mt-1" id="myAccordion">
				<div class="card">
					<div class="card-header" id="headingOne">
						<h2 class="mb-0">
							<button type="button" class="btn bg-primary text-white" data-toggle="collapse" :data-target="'#data'+page.itemId">
								{{page.itemId}}	
							</button>
						</h2>
					</div>
					<div class="col description-box">
						<span>{{page.description}}</span>
					</div>
					<div :id="'data'+page.itemId" class="collapse" aria-labelledby="headingOne" data-parent="#myAccordion">
						<div class="card-body">
							<template  v-for="(element,index) of page.subItems">
								<button
									class="item-decoration btn btn-link bg-blue"
									v-show="index === 0"
									:key="element.itemId+Math.floor(Math.random() * 2579) + index"
									@click="()=>onPageChange(page.itemId)"
								>
								{{page.itemId}}
								</button>
								<div :key="page.itemId+Math.floor(Math.random() * 8325) + index" class="list-item">
									<button
										v-bind:class="{'bg-yellow':  element.itemId.length === 5 }"  
										class="item-decoration btn btn-link"
										@click="()=>onPageChange(element.itemId)"
									>
										{{element.itemId}}
									</button>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-md-10">
			<div class="search-wrapper d-flex">
				<input v-model="keyword" class="form-control form-control-sm mt-2 mb-2 ml-3" type="text" placeholder="Search by description keywords..." style="width:15%">
				<button @click="loadPayableItems" class="btn btn-primary btn-sm mt-2 mb-2 ml-2">
					Search
				</button>
			</div>
			<md-table v-if="!isLoading && payableItems" v-model="payableItems" md-sort="ID" md-sort-order="asc" md-card>
				<md-table-row>
					<md-table-head>ID</md-table-head>
					<md-table-head>Description</md-table-head>
					<md-table-head>Unit</md-table-head>
					<md-table-head>Price</md-table-head>
					<md-table-head>Add to short list</md-table-head>
				</md-table-row>

				<md-table-row v-bind:class="{'bg-green': item.added}" cl :key="item.itemId+Math.floor(Math.random() * 77824) + 'index'" v-for="item of payableItems">
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.itemId}}</md-table-cell>
					<md-table-cell class="description-width" v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.description}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.unit}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.price}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId && !(item.added) && !(item.unit === 'הערה')" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						<input :checked="itemIds.includes(item.itemId)" v-if="item.itemId.length === 10" @change="addToList(item.itemId)" type="checkbox" />
					</md-table-cell>
					<md-table-cell v-if="item && item.itemId && (item.added)" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						<p v-if="item.itemId.length === 10">{{item.amount}}</p>
					</md-table-cell>
					<md-table-cell v-if="item && item.itemId && item.unit === 'הערה' && !(item.added)" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						<p v-if="item.itemId.length === 10"></p>
					</md-table-cell>
				</md-table-row>

			</md-table> 
		</div>
	</div>

		

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

export default {
	name: 'Payable-Items',
	components: {
		Paging,
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
		async loadPayableItems() {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName
				};
				if(!(this.keyword)) {
					params['itemId'] = this.idPrefix;
				} else {
					params['keyword'] = this.keyword;
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

.page-select{
	width: 23% !important;
}

.item-wrapper{
	border: 1px solid #ececec;
    padding: 5px;
    font-size: 10px;
}

.description-width{
	text-align: right;
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