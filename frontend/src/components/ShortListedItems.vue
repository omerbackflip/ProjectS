<template>
	<div>
		<div class="main-container">
			<template >
				<template v-if="(shortListedItems.length)" style="height: auto; border: 1px solid #eee">
				<!-- <div v-if="showSearch" class="search-wrapper d-flex mr-3">
					<input v-model="keyword" class="form-control form-control-sm mt-2 mb-2 ml-4" type="text" placeholder="חפש מילים מסויימיות..." style="width:auto">
					<button @click="loadListItems" class="btn btn-success btn-sm mt-2 mb-2 ml-2">
						Search
					</button>
				</div> -->
					<template  v-if="!isLoading && shortListedItems">
						<v-card-title>
							<v-text-field
								v-model="search"
								append-icon="mdi-magnify"
								label="Search Local"
								single-line
								hide-details
							></v-text-field>
							<v-flex >
								{{`Grand Total = ${grandTotal.toLocaleString(undefined,{maximumFractionDigits: 0})} `}}
								<Additional v-bind:user="user" />
							</v-flex>
						</v-card-title>
						<v-data-table 
							:headers="headers"
							:items="shortListedItems"
							disable-pagination
							bordered
							height="81vh"
							fixed-header
							hide-default-footer
							:search="search"
							dense>
							<template v-slot:[`item.price`]="{ item }">
								{{(item.price * user.discount).toFixed(2)}}
							</template>

							<template v-slot:[`item.description`]="{ item }">
								<!-- {{item.description.substr(12,300)}} -->
								{{item.description}}
							</template>

							<template v-slot:[`item.planned`]="{ item }">
								{{item.planned ? item.planned : ''}}
							</template>

							<template v-slot:[`item.paid`]="{ item }">
								{{item.paid ? item.paid : ''}}
							</template>

							<template v-slot:[`item.amount`]="{ item }">
								<input :id="item.itemId.slice(0,2)" 
										class="form-control form-control-sm" 
										@change="updateItem($event, item.itemId, 'amount')" 
										:value="item.amount"
										autocomplete="off">	
							</template>

							<template v-slot:[`item.topic`]="{ item }">
								<input @change="updateItem($event, item.itemId, 'topic')"
										class="form-control form-control-sm" 
										type="text" 
										:value="item.topic">
								<!-- <v-select 	@change="updateItem($event, item.itemId, 'topic')"
											v-model="item.topic"
											:items="topics"
											:value="item.topic"								
								></v-select> -->
							</template>

							<template :id="item.itemId" v-slot:[`item.total`]="{ item }">
								{{ item.amount ? (item.amount*item.price*user.discount).toLocaleString(undefined,{maximumFractionDigits: 0}):''}}
							</template>

							<template v-slot:[`item.remarks`]="{ item }">
								<textarea @change="updateItem($event, item.itemId, 'remarks')"
										  class="form-control form-control-sm mt-2" 
										  type="text" 
										  :value="item.remarks"></textarea>
							</template>

							<!-- ---------------------- Short listed attached files  ---------------------- -->
							<template v-slot:[`item.IMG`]="{ item }">
					
								<!-- Upload file -->
								<span  v-if="!(item.attachedFile)" class="image-upload">
									<input
										style="display: 'none'"
										id="raised-button-file"
										ref="attachFile"  @input="($event) => addAttach($event)"
										type="file"
									/>
									<label htmlFor="raised-button-file">
									<!-- <div @click="openFilePicker(item.itemId)">
										 <md-icon class="icon-clickable" variant="raised" component="span" >
											upload
										</md-icon>
									</div> -->
										<v-btn icon @click="openFilePicker(item.itemId)"> <v-icon small>upload</v-icon> </v-btn>
									</label> 
								</span>

								<!-- View/Download file -->
								<div v-if="(item.attachedFile)" class="image-upload">
									<viewer @inited="inited" class="viewer" ref="viewer">
										<template v-if="['image/gif', 'image/jpeg', 'image/png'].includes(item.attachedFile.mimetype) && item.imageSrc && item.imageSrc.data">
											<img :src="`data:image/png;base64,${item.imageSrc.data}`" class="rounded mx-auto d-block width-thumb">
										</template>
										<template v-else>
											<v-tooltip v-if="item.attachedFile.mimetype === 'application/pdf'" bottom>
												<template v-slot:activator="{ on }">
													<v-btn text x-small outlined @click="viewPDF(item.imageSrc.data)" v-on="on">view pdf</v-btn>
												</template>
											</v-tooltip>
										</template>
									</viewer>
									<v-btn icon @click="deleteAttach(item.itemId)">			<v-icon small>delete</v-icon></v-btn>
									<v-btn icon @click="downloadAttach(item.attachedFile)"> 	<v-icon small>download</v-icon> </v-btn>
								</div>
							</template>
							<!-- ---------------------- End Short listed attached files  ---------------------- -->

							<img id="largeImage" src="" alt="" srcset="">  <!-- What this line reffering to ??? -->
							<template v-slot:[`item.DEL`]="{ item }">
								<v-btn small class="icon-button" @click="deleteItem(item.itemId)">
									<v-icon small class="icon-clickable">delete</v-icon>
								</v-btn>
							</template>							
						</v-data-table>
					</template>
				</template>
			</template>
			<div style="position:static" v-if="!(shortListedItems.length)" class="mt-3 mb-4 text-center alert alert-warning container">
				There is no data in short-list.
			</div>
			<template v-if="isLoading">
				<md-progress-spinner></md-progress-spinner>
			</template>
		</div>
	</div>
</template>

<script>
import { 
	getAllShortListedItems,
	importShortListDataFile , 
	updateShortListItem,
	deleteShortListItem,
	removeFile,
	addFileToItem,
	downloadAttachedFile,
	getImageById
} from '../api';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from "v-viewer"
import pdf from 'vue-pdf'
import Additional from './Additional.vue'


export default {
	name: 'Short-Listed-Items',
	components: {
		MainHeader,
		Viewer,
		pdf,
		Additional,
	},
	//main data state used in component level
	data() {
		return {
			shortListedItems: [],
			idPrefixes: [],
			idPrefix: '01',
			isLoading : false,
			file: '',
			itemClicked: undefined,
			keyword: '',
			selectedItemId: '',
			grandTotal:0,
			showSearch: false,
			summary: [],
			user : {},
			message : '',
			headers:[
				{text:'סעיף', 			value:'itemId', 	class: 'hdr-styles'},
				{text:'תאור הסעיף', 	value:'description',class: 'hdr-styles', align:'right'},
				{text:'יחידה',			value:'unit', 		class: 'hdr-styles', align:'right', width: '1%'},
				{text:'מחיר',			value:'price', 		class: 'hdr-styles', align:'right', width: '4%'},
				{text:'מתוכנן',			value:'planned', 	class: 'hdr-styles', align:'right', width: '4%'},
				{text:'כמות',			value:'amount', 	class: 'hdr-styles', align:'right', width: '5%'},
				{text:'שולם',			value:'paid', 		class: 'hdr-styles', align:'right'},
				{text:'סה"כ',			value:'total', 		class: 'hdr-styles', align:'right'},
				{text:'נושא',			value:'topic', 		class: 'hdr-styles', align:'right'},
				{text:'הערות',			value:'remarks', 	class: 'hdr-styles', 				width: '18%'},
				{text:'מצורף',			value:'IMG', 		class: 'hdr-styles', 				width: '1%'},
				{text:'מחק',			value:'DEL', 		class: 'hdr-styles', 				width: '1%'},
			],
			messageType : 'danger',	
			disableFileUpload : false,
			search: '',
			topics: ['AAA','BBB'],
		}
	},
	methods: {
		
		// this is for preview the Image
		inited (viewer) {			
			this.$viewer = viewer
		},

		//basic load list function for short list
		async loadShortListedItems(page,keyword) {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName,
					discount: this.user.discount,
				};
				if(page) {
					params['itemId'] = page;
				} else if(keyword){
					params['keyword'] = this.keyword;
				}else {
					params['itemId'] = "01";
				}
				const response = await getAllShortListedItems(params);
				if (response.data) {
					this.shortListedItems = await Promise.all(response.data.result.map(async (item) => {
						try {
							if(item.attachedFile) {
								item.imageSrc = await getImageById({destination: item.attachedFile.path});
							}
							return item;							
						} catch (error) {
							return error;	//guess should be "return error" and not item as originaly 
						}
					}));
					this.$emit('getData', response.data.idPrefixes);
					this.grandTotal = response.data?.summaries?.grandTotalIDs;
					this.summary = response.data?.summaries?.summary;
					this.isLoading = false;
				}
			} catch (error) {
				console.log(error);
				this.isLoading = false;
			}
		},

		// toggleSearch(){
		// 	this.showSearch = !this.showSearch;
		// },

		//api call to import short list file  called from MainHeader.vue
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

		//used to update remark or amount for short list item
		async updateItem(e,itemId, key) {
			try {
				const body = {};
				if(e && e.target) {
					body[key] = String(e.target.value);  //"e.target.value" contains the content of the changed field (amount or remark)
					body.itemId = itemId;
					body.userName = this.user.userName;
					await updateShortListItem(body);
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},

		//used to remove any short listed item file
		async deleteAttach(itemId) {
			try {
				if(window.confirm(`Are you sure you want to delete file  ??`)){
					await removeFile(itemId,this.user.userName);
					this.loadShortListedItems();
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't delete the shortlist file",'danger');
			}
		},

		viewPDF(data){
			var win = window.open();
		    win.document.write(`<iframe src=data:application/pdf;base64,${data} frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen"><\/iframe>`);
		},

		//used to delete any short listed item
		async deleteItem(itemId, key) {
			try {
				if(window.confirm(`Are you sure you want to delete item  ${itemId}  ??`)){
					await deleteShortListItem(itemId,this.user.userName);
					this.loadShortListedItems();
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't delete the shortlist file",'danger');
			}
		},

		//used to add file to a short list item
		async addAttach(event) {
			try {
				event.preventDefault();
				if (event && event.target && event.target.files[0]) {
					await addFileToItem(event.target.files[0],this.user.userName,this.selectedItemId);
					this.showMessage("File Uploaded Successfully!",'success');
					this.loadShortListedItems();
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the file",'danger');
			}
		},

		//used to download file for a short list item
		async downloadAttach(attachedFile) {
			try {
				if(attachedFile && attachedFile.path){
					downloadAttachedFile({destination: attachedFile.filename});
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't download the file",'danger');
			}
		},

		// loadListItems(){
		// 	this.loadShortListedItems(0,this.keyword);
		// },

		scrollToItem(itemId) {
			const el = document.getElementById(itemId);
			if(el) {
			    el.scrollIntoView({behavior: "smooth"});
				this.itemClicked = this.summary.filter(item => item.itemId === itemId)[0];
			}
		},

		showMessage(message,type){
			this.message = message;
			this.messageType = type;
			setTimeout(() => this.message = '', 6000);	
			if(this.$refs.attachFile) {
				this.$refs.attachFile.value=null;
			}
			if(this.$refs.fileInput) {
				this.$refs.fileInput.value=null;
			}
		},

		openFilePicker(id) {
			this.selectedItemId = id;
			document.getElementById("raised-button-file").click();
		},
	},

	created(){
		const user = JSON.parse(getUser());
		this.user = user;
		this.loadShortListedItems();
	}
}
</script>

<style>


.hdr-styles{
	background: blue !important;
	color: white !important;
}
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
	text-align: center !important;
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
    width: 5px;
}

.icon-clickable{
    cursor: pointer;
}
.description-width{
	width: 28% !important;
	text-align: right;
}
.amount-width{
	width: 56% !important;
	border-radius: 5px;
	border: 1px solid #ececec;
}
.IMG-width{
	width: 10% !important;
}

.controls-width{
	width: 5% !important;
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
.bg-yellow{
	color: yellow !important;
}

.bg-blue{
	color: blue !important;
}
.item-decoration{
	text-decoration: none;
	cursor: pointer;
	margin-bottom: 4px;
	color: black;
}
.width-0{
	width: 160px !important;
}
.width-thumb{
	width: 30px;
	cursor: pointer;
}

.icon-image
{
    width: 80px;
    cursor: pointer;
}

</style>