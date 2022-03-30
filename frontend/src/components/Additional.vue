<template>
    <v-dialog max-width="600px">
        <template v-slot:activator="{on,attrs}">
            <v-btn class="mx-4 dark" v-bind="attrs" v-on="on">Additionals</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <h2>Additionals</h2>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="additionalList"
                    disable-pagination
                    hide-default-footer
                    dense>
                </v-data-table>
                <span>
                    <v-text-field v-model="additionalDescription" label="תאור"></v-text-field>
                    <v-text-field v-model="additionalAmount" label="סה'כ"></v-text-field>
                </span>
                <v-btn small @click="addAdditional">add</v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script>
import { 
    addShortListItems,
    getAdditionals,
} from '../api';

export default {
    props:[
        'user',
    ],
	data() {
		return {
            additionalList: [],
            additionalID : '99.00.0000',
            additionalDescription : '',
            additionalAmount : '',
			headers:[
				{text:'סעיף', 			value:'itemId', 	class: 'hdr-styles'},
				{text:'תאור הסעיף', 	value:'description',class: 'hdr-styles', align:'right'},
                {text:'סה"כ',			value:'amount',		class: 'hdr-styles', align:'right'},
			],
        }
	},

    methods : {
        async loadAdditionals(additional) {
            try {
                this.isLoading = true;
                const params = {
                    additional: this.additionalID,
                    userName: this.user.userName,
                };
                const response = await getAdditionals(params);
                if (response.data) {
                    this.additionalList = response.data.result;
                }
            } catch (error) {
                console.log(error);
                this.isLoading = false;
            }
        },

        addAdditional(){
            const body = {
                additional  : true,
                userName    : this.user.userName,
                itemId      : this.additionalID,
                description : this.additionalDescription,
                amount      : this.additionalAmount,
                unit        : 'יח',
                price       : 1,     //      1/this.user.discount,
                remarks     : 'תוספות',
                topic       : 'תוספות'
            }
            const response = addShortListItems(body);
        }
    },

    created(){
		this.loadAdditionals();
	}
}
</script>
