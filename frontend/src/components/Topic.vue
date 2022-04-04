<template>
    <v-dialog max-width="600px">
        <template v-slot:activator="{on,attrs}">
            <v-btn class="mx-4 dark" v-bind="attrs" v-on="on">{{topic}}</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <h2 >{{topic}} - {{total.toLocaleString(undefined,{maximumFractionDigits: 0})}}</h2>
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
                        {{item.amount}}
                    </template>
                    <template v-slot:[`item.price`]="{ item }">
                        {{(item.price*user.discount).toLocaleString(undefined,{maximumFractionDigits: 0})}}
                    </template>
                    <template v-slot:[`item.total`]="{ item }">
                        {{(item.amount*item.price*user.discount).toLocaleString(undefined,{maximumFractionDigits: 0})}}
                    </template>                    
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { 
    getItemsID,
} from '../api';

export default {
    props:[
        'user',
        'topic',
        'total',
    ],
	data() {
		return {
            topicList: [],
			headers:[
				{text:'סעיף', 			value:'itemId', 	class: 'hdr-styles'},
				{text:'תאור הסעיף', 	value:'description',class: 'hdr-styles', align:'right'},
                {text:'מחיר',			value:'price',		class: 'hdr-styles', align:'right'},
                {text:'כמות',			value:'amount',		class: 'hdr-styles', align:'right'},
                {text:'סה"כ',			value:'total',		class: 'hdr-styles', align:'right'},
			],
            dialog: false,
        }
	},

    methods : {
        async loadTopic() {
            try {
                this.isLoading = true;
                const params = {
                    topic: this.topic,
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
</style>
