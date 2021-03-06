// This routes are custum routes made for the specific needs of the header
export const routes = [             
    {   title: 'PaybleItemList',
        icon: 'list_alt',
        path: '/payable-items-list',
        children: []
    },
    {   title: 'ShortList',
        icon: 'money',
        path: '/short-listed-items',
        children: []
    },    
    {   title: 'Summary',
        icon: 'money',
        path: '/summary',
        children: []
    },
    // {   title: 'Payable Items',
    //     icon: 'payment',
    //     children: [{
    //         title: "Lists",
    //         path: '/payable-items-list',
    //         action: null
    //         },{
    //         title: "Import",
    //         path: null,
    //         action: 'import payable items',
    //         },{
    //         title: "Delete",
    //         path: null,
    //         action: 'delete payable items',}
    //     ]
    // },
    {   title: 'Maintnence',
        icon: 'list_alt',
        children: [{
            title: "=== Short-List ===",
            path: null,
            action: '',
            },{
            title: "Import Short-list",
            path: null,
            action: 'import short listed items',
            },{
            title: "Export Short-list",
            path: null,
            action: 'export short listed items',
            },{
            title: "Delete Short-list",
            path: null,
            action: 'delete short listed items',
            },{
            title: "Copy Short-list",
            path: null,
            action: 'copy short listed items',
            },{
            title: "=== Payable Items ===",
            path: null,
            action: '',
            },{
            title: "Import Payable items",
            path: null,
            action: 'import payable items',
            },{
            title: "Delete Payable items",
            path: null,
            action: 'delete payable items',
            },{
            title: "=== Users ===",
            path: null,
            action: '',
            },{
            title: 'Users',
            icon: 'person',
            path: '/users'    
            }
        ]
    },
    // {   title: 'Users',
    //     icon: 'person',
    //     path: '/users',
    //     children: []
    // },
]