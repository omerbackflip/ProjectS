<template>
    <v-dialog max-width="1500px">
        <template v-slot:activator="{on,attrs}">
            <v-btn class="mx-4 dark font-size-12" v-bind="attrs" v-on="on">{{header}}</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <!-- <h2 >{{topic}} - {{total.toLocaleString(undefined,{maximumFractionDigits: 0})}}</h2> -->
                <h2> {{header}}
                    <v-btn @click="loadTopic()"> Refresh </v-btn>
                    <v-btn > <v-icon small>download</v-icon> </v-btn>
                </h2>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="topicList"
                    disable-pagination
                    hide-default-footer
                    bordered
                    height="60vh"
                    fixed-header
                    class="elevation-1"
                    dense>
                    <template v-slot:[`item.amount`]="{ item }">
                        <input  class="form-control form-control-sm" 
                                @change="updateItem($event, item.itemId, 'amount')" 
                                :value="item.amount"
                                autocomplete="off">	
                    </template>
                    <template v-slot:[`item.paid`]="{ item }">
                        {{item.paid ? item.paid : ''}}
                    </template>
                    <template v-slot:[`item.planned`]="{ item }">
                        {{item.planned ? item.planned : ''}}
                    </template>
                    <template v-slot:[`item.price`]="{ item }">
                        {{(item.price*user.discount).toLocaleString(undefined,{maximumFractionDigits: 0})}}
                    </template>
                    <template v-slot:[`item.total`]="{ item }">
                        {{item.amount ? (item.amount*item.price*user.discount).toLocaleString(undefined,{maximumFractionDigits: 0}) : ''}}
                    </template>
                    <template v-slot:[`item.topic`]="{ item }">
                        <textarea @change="updateItem($event, item.itemId, 'topic')"
                                    class="form-control form-control-sm mt-2" 
                                    type="text" 
                                    :value="item.topic"></textarea>
                    </template>
                    <template v-slot:[`item.remarks`]="{ item }">
                        <textarea @change="updateItem($event, item.itemId, 'remarks')"
                                    class="form-control form-control-sm mt-2" 
                                    type="text" 
                                    :value="item.remarks"></textarea>
                    </template>                    
                </v-data-table>
                <template v-if = "itemId === 99">
                    <v-row>
                        <v-text-field class ="mx-4" v-model="additionalID"></v-text-field>
                        <v-text-field class ="mx-4" v-model="additionalAmount" label="סה'כ"></v-text-field>
                        <v-text-field class ="mx-4" v-model="additionalDescription" label="תאור"></v-text-field>
                    </v-row>
                <v-btn small @click="addAdditional">add</v-btn>
                </template>
            </v-card-text>
                    	  <v-snackbar v-model="snackbar">
      {{ snackBarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" snackBarText v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
        </v-card>
    </v-dialog>
</template>

<script>
import { 
    getItemsID,
    addShortListItems,
	updateShortListItem,
} from '../api';

export default {
    props:[
        'user',
        'topic',
        'header',
        'itemId',
    ],
	data() {
		return {
            topicList: [],
			headers:[
				{text:'סעיף', 			value:'itemId', 	class: 'hdr-styles'},
				{text:'תאור הסעיף', 	value:'description',class: 'hdr-styles', align:'right', width: '25%'},
                {text:'יחידה',			value:'unit',		class: 'hdr-styles', align:'right'},
                {text:'מחיר',			value:'price',		class: 'hdr-styles', align:'right'},
                {text:'מתוכנן',			value:'planned',	class: 'hdr-styles', align:'right'},
                {text:'כמות',			value:'amount',		class: 'hdr-styles', align:'right'},
                {text:'אושר',			value:'paid',   	class: 'hdr-styles', align:'right'},
                {text:'סה"כ',			value:'total',		class: 'hdr-styles', align:'right'},
                {text:'נושא',			value:'topic',		class: 'hdr-styles', align:'right', width: '10%'},
                {text:'הערה',			value:'remarks',		class: 'hdr-styles', align:'right', width: '20%'},
			],
            dialog: false,
            additionalID : '99.00.????',
            additionalDescription : '',
            additionalAmount : '',
            	  snackbar: false,
	  snackBarText: '',
        }
	},

    methods : {
        async loadTopic() {
            try {
                this.isLoading = true;
                const params = {
                    topic: this.itemId ? '' : this.topic, // if itemId exsit put topic empty...
                    itemId: this.itemId,
                    userName: this.user.userName,
                };
                const response = await getItemsID(params);
                if (response.data) {
                    this.topicList = response.data.result;
                }
            } catch (error) {
                console.log(error);
                this.isLoading = false;
            }
        },
        
        addAdditional(){
            const body = {
                additional  : true, // this flag to allow insert new line to short_list with dummy itemId "99.00.xxxx"
                userName    : this.user.userName,
                itemId      : this.additionalID,
                description : this.additionalDescription,
                amount      : this.additionalAmount,
                unit        : 'יח',
                price       :  1/this.user.discount,
                remarks     : 'תוספות',
                topic       : 'תוספות'
            };
            addShortListItems(body);
            this.additionalDescription='';
            this.additionalAmount='';
            this.loadTopic()
        },

        //used to update remark or amount for short list item
		async updateItem(e,itemId, fieldName) {
			try {
				const body = {};
				if(e && e.target) {
					body[fieldName] = String(e.target.value);  //"e.target.value" contains the content of the changed field (amount or remark)
					body.itemId = itemId;
					body.userName = this.user.userName;
					await updateShortListItem(body);
            this.snackbar = true;
            this.snackBarText = "Successfully updated item!";
				}
			} catch (error) {
				console.log(error);
				this.showMessage("Couln't upload the shortlist file",'danger');
			}
		},
    },

    created(){
		this.loadTopic();
	}
}
</script>

<style scoped>
h2 {
    width: 100%;
    text-align:center;
}
.font-size-12{
	font-size: 12px;
}
</style>
