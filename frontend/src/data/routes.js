export const routes = [
    {   title: 'רשימה',
        icon: 'list_alt',
        path: '/payable-items-list',
        children: []
    },
    {   title: 'חשבון חלקי',
        icon: 'money',
        path: '/short-listed-items',
        children: []
    },    
    {   title: 'סיכום',
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
    {   title: 'ניהול',
        icon: 'list_alt',
        children: [{
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
            title: "___________________",
            path: null,
            action: '',
            },{
            title: "Import Payable items",
            path: null,
            action: 'import payable items',
            },{
            title: "Delete Payable items",
            path: null,
            action: 'delete payable items',}
        ]
    },
    {   title: 'Users',
        icon: 'person',
        path: '/users',
        children: []
    },
]