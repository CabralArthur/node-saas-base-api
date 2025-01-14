const MODULE_ID_BY_NAME = {
	PROVIDERS: 1,
	DEVICES: 2,
	ASSETS: 3,
	DASHBOARD: 4,
	ASSET_RESPONSIBLES: 5
};

const PERMISSIONS = {
	READ: 'READ',
	UPDATE: 'UPDATE',
	DELETE: 'DELETE',
	CREATE: 'CREATE',
};

const PERMISSION_MODULE_ID_BY_NAME = {
	PROVIDERS: {
		READ: 1,
		CREATE: 2,
		UPDATE: 3,
		DELETE: 4,
	},
	DEVICES: {
		READ: 5,
		CREATE: 6,
		UPDATE: 7,
		DELETE: 8,
	},
	ASSETS: {
		READ: 9,
		CREATE: 10,
		UPDATE: 11,
		DELETE: 12
	},
	DASHBOARD: {
		READ: 13,
	},
	ASSET_RESPONSIBLES: {
		READ: 14,
		CREATE: 15,
		UPDATE: 16,
		DELETE: 17
	}
};

const PERMISSION_MODULES = {
	PROVIDERS: 'PROVIDERS',
	DEVICES: 'DEVICES',
	ASSETS: 'ASSETS',
	DASHBOARD: 'DASHBOARD',
	ASSET_RESPONSIBLES: 'ASSET_RESPONSIBLES'
};

export {
	PERMISSIONS,
	MODULE_ID_BY_NAME,
	PERMISSION_MODULES,
	PERMISSION_MODULE_ID_BY_NAME
};
