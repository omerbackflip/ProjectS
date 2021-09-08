<template>
<div class="main-container">
	<template >
		<el-container v-if="(shortListedItems.length)" style="height: 900px; border: 1px solid #eee">
			<el-aside width="200px">
				<el-menu>
					<el-submenu :key="page.itemId+Math.floor(Math.random() * 1548) + index" v-for="(page,index) of idPrefixes"	:index="String(index)+1">
						<template  #title>
							<span @click="()=>onPageChange(page.itemId)">{{page.itemId+" "+page.description}}</span>
						</template>
						<el-menu-item-group :key="page.itemId+index+Math.floor(Math.random() * 1228)" v-for="(element,index) of page.subItems">
							<el-menu-item :index="String(index)" v-bind:class="{'bg-blue':  element.length === 5 }" @click="()=>onPageChange(element)">
								{{element}}
							</el-menu-item>					
						</el-menu-item-group>
					</el-submenu>
				</el-menu>
			</el-aside>

			<el-container>
		    	<el-header>
					<main-header
						title="Short Listed Items"
						:shortList="true"
						@loadList="loadShortListedItems"
					>
					</main-header>
				</el-header>

				<el-main>

					<el-table 
						v-if="!isLoading && shortListedItems" 
						:data="shortListedItems"
						border
					>

						<el-table-column prop="itemId" label="ID" width="100">
							<span slot-scope="scope" v-bind:class="{'area-wrapper': scope.row.itemId.length === 2 , 'sub-area-wrapper':  scope.row.itemId.length === 5 }">
								{{scope.row.itemId}}
							</span>
						</el-table-column>

						<el-table-column width="800" prop="description" label="Description" align="right">
							<span class="description-width" slot-scope="scope" v-bind:class="{'area-wrapper': scope.row.itemId.length === 2 , 'sub-area-wrapper':  scope.row.itemId.length === 5 }">
								{{scope.row.description}}
							</span>
						</el-table-column>

						<el-table-column prop="unit" label="Unit" width="70" align="right">
							<span slot-scope="scope">
								{{scope.row.unit}}
							</span>
						</el-table-column>
						
						<el-table-column prop="price" label="Price" width="60">
							<span slot-scope="scope">
								{{scope.row.price}}
							</span>					
						</el-table-column>

						<el-table-column prop="amount" label="Amount" width="100">
							<span slot-scope="scope">
								<input class="amount-width" @change="updateItem($event, scope.row.itemId, 'amount')" :value="scope.row.amount" />	
							</span>					
						</el-table-column>
						
						<el-table-column prop="total" label="Total" width="100">
							<span slot-scope="scope">
								{{scope.row.amount * scope.row.price}}							
							</span>					
						</el-table-column>

						<el-table-column prop="remarks" label="Remarks" width="250">
							<span slot-scope="scope">
								<textarea @change="updateItem($event, scope.row.itemId, 'remarks')"
								class="form-control form-control-sm" type="text" :value="scope.row.remarks"></textarea>
							</span>					
						</el-table-column>

						<el-table-column prop="IMG" label="IMG" >
							<span slot-scope="scope">
								<div class="row">
									<div class="col">
										<div  v-if="!(scope.row.attachedFile)" class="image-upload">
											<input
												style="display: 'none'"
												id="raised-button-file"
												ref="attachFile"  @input="addFile($event, scope.row.itemId)"
												type="file"
											/>
											<label htmlFor="raised-button-file">
											<div @click="openFilePicker()">
												<md-icon class="icon-clickable" variant="raised" component="span" >
													upload
												</md-icon>
											</div>
											</label> 
										</div>
										<div v-if="(scope.row.attachedFile)" class="image-upload ">
											<template v-if="['image/gif', 'image/jpeg', 'image/png'].includes(scope.row.attachedFile.mimetype) && scope.row.imageSrc && scope.row.imageSrc.data">
												<img @click="downloadFile(scope.row.attachedFile)" :src="`data:image/png;base64,${scope.row.imageSrc.data}`" class="rounded mx-auto d-block width-thumb">
											</template>
											<template v-else>
												<button class="icon-button" @click="downloadFile(scope.row.attachedFile)"><md-icon  class="icon-clickable">download</md-icon></button>
											</template>
										</div>
									</div>
									<div class="col">
									</div>
								</div>
							</span>					
						</el-table-column>

						<el-table-column prop="DEL" label="DEL" >
							<button class="icon-button" @click="deleteItem(scope.row.itemId)"><md-icon  class="icon-clickable">delete</md-icon></button>
						</el-table-column>
					</el-table>
				</el-main>

				<el-footer>
					<p class="font-weight-bold ml-1">Summary</p>
					<div class="ml-2">
						<div class="row justify-content-space-around font-weight-bold" >
							<div v-if="summary && summary.length" class="col">
								{{`  ${summary[0].description}  -  	${summary[0].itemId} 		 ${summary[0].total } 	`}}
							</div>
							<div class="col">
								{{`Grand Total= ${grandTotal} `}}
							</div>
						</div>
					</div>

				</el-footer>
			</el-container>

		</el-container>

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
	downloadAttachedFile,
	getImageById
} from '../api';
import {getUser} from '../data/utils';
import MainHeader from './MainHeader.vue';

export default {
	name: 'Short-Listed-Items',
	components: {
		MainHeader	
	},
	//main data state used in component level
	data() {
		return {
			shortListedItems: [],
			idPrefixes: [],
			idPrefix: '01',
			isLoading : false,
			file: '',
			keyword: '',
			grandTotal:0,
			summary: [],
			user : {},
			message : '',
			messageType : 'danger',
			disableFileUpload : false,
		}
	},
	methods: {
		//basic load list function for short list
		async loadShortListedItems(key) {
			try {
				this.isLoading = true;
				const params = {
					userName: this.user.userName,
				};
				if(!(this.keyword || key)) {
					params['itemId'] = this.idPrefix;
				} else {
					params['keyword'] = this.keyword || key;
				}
				const response = await getAllShortListedItems(params);
				if (response.data) {
					this.shortListedItems = await Promise.all(response.data.result.map(async (item) => {
						try {
							if(item.attachedFile) {
								item.imageSrc = await getImageById({destination: item.attachedFile.urlImage});
							}
							return item;							
						} catch (error) {
							console.log(error);
							return item;
						}
					}));
					this.idPrefixes = response.data.idPrefixes.map(prefix=>{
						const preData = {
							...prefix,
							subItems: prefix.subItems.map(el=>{
								if(el.itemId?.length === 10){
									return {
										...el,
										itemId:el.itemId.slice(0,5)
									};
								} else {
									return el;
								}
							})
						}			
						return {...preData , subItems: [...new Set(preData.subItems.map(id => id.itemId))]};
					});
					this.grandTotal = response.data?.summaries?.grandTotal;
					this.summary = response.data?.summaries?.summary.filter(item =>{
						return this.idPrefix === item.itemId
					});
					this.isLoading = false;
				}
			} catch (error) {
				console.log(error);
				this.isLoading = false;
			}
		},
		//export excel list
		async exportExcel(){
			try {
				window.open(`${exportData}?userName=${this.user.userName}`);	
			} catch (error) {
				console.log(error);
			}
		},
		//file handler
		onFileSelect(event) {
			event.preventDefault();
			if (event && event.target && event.target.files[0]) {
				const {name , size} = event.target.files[0];
				const type = this.getExtension(name);
				if (!(['.xls','.xlsx','.docx'].includes(type))) {
					this.showMessage(`Sorry! ${type} is not supported!` , 'danger');
					return;
				} else if ((size / 1024 / 1024) > 1) {
					this.showMessage(`Sorry, your file size exceeds the limit.` , 'danger');
					return;
				}
				this.file = event.target.files[0];
			}
		},
		//api call to import short list file
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
		//used to delete any short listed item
		async deleteItem(itemId, key) {
			try {
				await deleteShortListItem(itemId,this.user.userName);
				this.loadShortListedItems();
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
		//used to add file to a short list item
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
		//used to download file for a short list item
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
		openFilePicker() {
			document.getElementById("raised-button-file").click();
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
.image-upload > input
{
    display: none;
}

.icon-image
{
    width: 80px;
    cursor: pointer;
}
</style>