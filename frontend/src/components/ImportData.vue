<template>
<div class="container">
    <div :class="{'alert-danger': messageType === 'danger', 'alert-success': messageType === 'success'}" class="alert m-4 mb-4" v-if="message">
        {{message}}
    </div>
    <div class="import-wrapper">
        <h2>Import Payable Items Sheet</h2>
        <div class="mt-3 import-file-wrapper">
            <div class="row">
                <div class="col">
                    Please select the document to import
                </div>
                <div class="col">
                    <input 
                        @change="onFileSelect($event)" 
                        id="fileSelect" 
						ref="fileInput"
                        type="file" 
                        :disabled="disableFileUpload"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    />  
                </div>
            </div>
        </div>
        <div class="mt-3 mb-3">
            <button :disabled="disableFileUpload || !file" @click = "importData()" class="btn btn-success">
                Import Data
            </button>
        </div>
    </div>
</div>
</template>

<script>

import {getCount, importDataFile} from '../api/index';

export default {
	name: 'Import-Data',
	data() {
		return{
			file: '',
			message : '',
			messageType : 'danger',
			disableFileUpload : false,
		}
    },
	methods: {
		// User to check if payload items are already uploaded
		async checkForData(){
			try {
				const response = await getCount({});
				if (response.data && response.data.count < 0 ) {
					this.message = "Payload items are already uploaded";
					this.messageType = 'success';
					this.disableFileUpload = true;
				}
			} catch (error) {
				console.log(error);
			}
		},
		// file handler function
		onFileSelect(event) {
			event.preventDefault();
			if (event && event.target && event.target.files[0]) {
				const {name , size} = event.target.files[0];
				const type = this.getExtension(name);
				if (!(['.xls','.xlsx'].includes(type))) {
					this.message = `Sorry! ${type} is not supported!`;
					this.messageType = 'danger';
					setTimeout(() => this.message = '', 4000);
					this.$refs.fileInput.value=null;
					return;
				} else if ((size / 1024 / 1024) > 25) {
					this.message = `Sorry, your file size exceeds the limit.`;
					this.messageType = 'danger';
					setTimeout(() => this.message = '', 4000);	
					this.$refs.fileInput.value=null;
					return;
				}
				this.file = event.target.files[0];
			}
		},
		// Import data API call
		async importData(){
			try {
				if(this.file){
					const response = await importDataFile(this.file);
					if(response.data && !(response.data.hasErrors)) {
						this.message = response.data.message;
						this.messageType = 'success';
						this.$refs.fileInput.value=null;
						setTimeout(() => this.message = '', 4000);	
						this.disableFileUpload = true;
					}
				}		
			} catch (error) {
				console.log(error);
			}
		}, 
		getExtension(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i);
		}
	},
	created(){
		this.checkForData();
	}
}
</script>

<style scoped>
.active {
	background-color: red;
}

.paging-wrapper{
    display: flex;
    flex-direction: row;
    margin-top: 15px;
}

.button-page{
    min-width: unset;
    color: #696cff;
    margin: 5px;
}
</style>