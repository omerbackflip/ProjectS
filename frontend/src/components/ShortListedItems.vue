<template>
<div class="main-container">
	<div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
		{{message}}
	</div>
	<div v-if="!(shortListedItems.length || keyword)" class="row">
		<div class="float-right">
			<input 
				@change="onFileSelect($event)" 
				id="fileSelect" 
				ref="fileInput"
				:disabled = "disableFileUpload"
				type="file" 
				accept=".xlsx, application/vnd.openxmlformds-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
			/>
		<button :disabled="!file || disableFileUpload" @click = "shortListItems()" class="mt-2 mb-2 btn btn-success">
			Short List
		</button>

		</div>
	</div>
	<div class="row">
		<div class="col">
			<h2>Short Listed Items</h2>
		</div>
	</div>
	<button v-show="shortListedItems.length" :disabled="!(shortListedItems.length)" @click = "exportExcel()" class="mt-2 mb-2 btn btn-primary ml-3">
		<md-icon class="text-white">download</md-icon> Export Data
	</button>

	<template v-if="!isLoading && shortListedItems">
	<div class="row">
		<div class="col-md-1">
			<div :key="page.itemId" v-for="(page) of idPrefixes" class="text-center item-wrapper">
				<div class="row">
					<div class="col">
						<button @click="()=>onPageChange(page.itemId)" class="btn bg-primary mt-2 mb-2 text-white">
							{{page.itemId}}
						</button>
					</div>
					<div class="col description-box">
						<span>{{page.description}}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="col-md-11">
			<div class="search-wrapper d-flex">
				<input v-model="keyword" class="form-control form-control-sm mt-2 mb-2 ml-3" type="text" placeholder="Search by description keywords..." style="width:15%">
				<button @click="loadShortListedItems" class="btn btn-primary btn-sm mt-2 mb-2 ml-2">
					Search
				</button>
			</div>
			<md-table v-model="shortListedItems" md-sort="ID" md-sort-order="asc" md-card>
				<md-table-row>
					<md-table-head>ID</md-table-head>
					<md-table-head>Description</md-table-head>
					<md-table-head>Unit</md-table-head>
					<md-table-head>Price</md-table-head>
					<md-table-head>Amount</md-table-head>
					<md-table-head>Total</md-table-head>
					<md-table-head>Remarks</md-table-head>
					<md-table-head>Controls</md-table-head>
				</md-table-row>

				<md-table-row :key="item.itemId" v-for="item of shortListedItems">
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.itemId}}</md-table-cell>
					<md-table-cell class="description-width" v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.description}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.unit}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.price}}</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						<input  @change="updateItem($event, item.itemId, 'amount')" :value="item.amount" />	
					</md-table-cell>
					<md-table-cell v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						{{item.amount * item.price}}</md-table-cell>
					<md-table-cell class="remarks-width" v-if="item && item.itemId" v-bind:class="{'area-wrapper': item.itemId.length === 2 , 'sub-area-wrapper':  item.itemId.length === 5 }">
						<textarea @change="updateItem($event, item.itemId, 'remarks')"
						class="form-control form-control-sm" type="text" :value="item.remarks"></textarea>	
					</md-table-cell>

					<md-table-cell class="controls-width" v-if="item && item.itemId">
					<div class="row">
						<div class="col">
							<div v-if="!(item.attachedFile)">
								<input 	ref="attachFile"  @input="addFile($event, item.itemId)" id="file-input" type="file"/>
							</div>
							<div v-if="(item.attachedFile)" class="image-upload">
								<button class="icon-button" @click="downloadFile(item.attachedFile)"><md-icon  class="icon-clickable">download</md-icon></button>
							</div>
						</div>
						<div class="col">
							<button class="icon-button" @click="deleteItem(item.itemId)"><md-icon  class="icon-clickable">delete</md-icon></button>
						</div>
					</div>
					</md-table-cell>

				</md-table-row>

			</md-table> 
		</div>
	</div>
	</template>

	<div v-if="!(shortListedItems.length)" class="mt-3 mb-4 text-center alert alert-warning container">
		No Data has been short listed!
	</div>

	<template v-if="isLoading">
		<md-progress-spinner></md-progress-spinner>
	</template>

</div>
</template>

<script>
import { 
	getAllShortListedItems,
	importShortListDataFile , 
	updateShortListItem,
	deleteShortListItem,
	exportData,
	addFileToItem,
	downloadAttachedFile
} from '../api';
import Paging from './Paging.vue';
import {getUser} from '../data/utils';

export default {
	name: 'Short-Listed-Items',
	components: {
		Paging,
	},
	data() {
		return {
			shortListedItems: [],
			idPrefixes: [],
			idPrefix: '01',
			isLoading : false,
			file: '',
			keyword: '',
			summary: [],
			user : {},
			message : '',
			messageType : 'danger',
			disableFileUpload : false,
		}
	},
	methods: {
		async loadShortListedItems() {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName,
				};
				if(!(this.keyword)) {
					params['itemId'] = this.idPrefix;
				} else {
					params['keyword'] = this.keyword;
				}
				const response = await getAllShortListedItems(params);
				if (response.data) {
					this.shortListedItems = response.data.result;
					this.idPrefixes = response.data.idPrefixes;
					this.isLoading = false;
				}
			} catch (error) {
				console.log(error);
				this.isLoading = false;
			}
		},
		async exportExcel(){
			try {
				window.open(`${exportData}?userName=${this.user.userName}`);	
			} catch (error) {
				console.log(error);
			}
		},
		onFileSelect(event) {
			event.preventDefault();
			if (event && event.target && event.target.files[0]) {
				const {name , size} = event.target.files[0];
				const type = this.getExtension(name);
				if (!(['.xls','.xlsx'].includes(type))) {
					this.showMessage(`Sorry! ${type} is not supported!` , 'danger');
					return;
				} else if ((size / 1024 / 1024) > 1) {
					this.showMessage(`Sorry, your file size exceeds the limit.` , 'danger');
					return;
				}
				this.file = event.target.files[0];
			}
		},
		async shortListItems() {
			try {
				if(this.file) {
					const response = await importShortListDataFile(this.file , this.user.userName);
					if (response.data && !(response.data.hasErrors)) {
						this.showMessage(response.data.message,'success');
						this.loadShortListedItems();
					} else {
						this.showMessage(response.message,'danger');
					}	
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
		async updateItem(e,itemId, key) {
			try {
				const body = {};
				if(e && e.target && e.target.value) {
					body[key] = String(e.target.value);
					body.itemId = itemId;
					body.userName = this.user.userName;
					await updateShortListItem(body);
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
		async deleteItem(itemId, key) {
			try {
				await deleteShortListItem(itemId,this.user.userName);
				this.loadShortListedItems();
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
		async addFile(event, itemId) {
			try {
				event.preventDefault();
				if (event && event.target && event.target.files[0]) {
					await addFileToItem(event.target.files[0],this.user.userName,itemId);
					this.showMessage("File Uploaded Successfully!",'success');
					this.loadShortListedItems();
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the file",'danger');
			}
		},
		async downloadFile(attachedFile) {
			try {
				if(attachedFile && attachedFile.path){
					downloadAttachedFile({destination: attachedFile.path});
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't download the file",'danger');
			}
		},
		showMessage(message,type){
			this.message = message;
			this.messageType = type;
			setTimeout(() => this.message = '', 4000);	
			if(this.$refs.attachFile) {
				this.$refs.attachFile.value=null;
			}
			if(this.$refs.fileInput) {
				this.$refs.fileInput.value=null;
			}
		},
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
		},
		onPageChange(page) {
			this.idPrefix = page;
			this.loadShortListedItems();
		},
	},
	created(){
		const user = JSON.parse(getUser());
		this.user = user;
		this.loadShortListedItems();
	}
}
</script>

<style scoped>
.area-wrapper{
    border: 1px solid yellow;
    padding: 12px;
    background: yellow;
    border-radius: 12px;
}

.sub-area-wrapper{
    border: 1px solid blue;
    padding: 12px;
    background: blue;
    border-radius: 12px;
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
}

.filters-container{
    background: #ececec;
    border-radius: 12px;
    float: right;
    width: 70%;
    padding: 15px 30px 15px 30px;
}

.width-amount{
    width: 13%;
}

.width-remarks{
    width: 13%;
}

.width-controls{
    width: 20px;
}

.icon-clickable{
    cursor: pointer;
}
.description-width{
	width: 28% !important;
}

.remarks-width{
	width: 20% !important;
}

.controls-width{
	width: 25% !important;
	text-align-last: center;
}

td{
	border-left: 1px solid #ececec;
}

.summary-wrapper{
	border: 1px solid #ececec;
    margin: 16px;
    padding-top: 14px;
}

.icon-button{
	border: none;
    background: transparent;
}

.image-upload > input
{
    display: none;
}

.upload-icon
{
    cursor: pointer;
}

.item-wrapper{
	border: 1px solid #ececec;
    padding: 5px;
    font-size: 10px;
}

</style>