import httpStatus from 'http-status';

import { map, toUpper, get } from 'lodash';
import { Device } from '@models';
import { ExceptionUtils } from '@utils';
import { ProviderService } from '@services';

export default class DeviceService {
	constructor() {
		this.providerService = new ProviderService();
	}

	async validateDeviceProvider({ data, meta }) {
		await this.providerService.find({ id: data.providerId, teamId: meta.teamId });

		return true;
	}

	async validateDeviceSerialKey({ serialKey, providerId, teamId }) {
		const parsedSerialKey = toUpper(serialKey);

		const existentDevice = await Device.count({
			where: {
				teamId,
				providerId,
				serialKey: parsedSerialKey
			}
		});

		if (existentDevice) {
			throw new ExceptionUtils({
				status: httpStatus.CONFLICT,
				code: 'DEVICE_ALREADY_EXISTENT',
				message: 'Device is already registered.'
			});
		}

		return true;
	}

	async create({ data, meta }) {
		await this.validateDeviceProvider({ data, meta });
		await this.validateDeviceSerialKey({ serialKey: data.serialKey, providerId: data.providerId, teamId: meta.teamId });

		const { loggedUserId, teamId } = meta;
		const deviceData = { ...data, serialKey: toUpper(data.serialKey), creatorId: loggedUserId, teamId };

		const device = await Device.create(deviceData);

		return device;
	}

	async list(filter) {
		const { teamId } = filter;

		const devices = await Device.findAll({
			where: {
				teamId,
				isDeleted: false
			}
		});

		return map(devices, device => device.toJSON());
	}

	async find(filter) {
		const device = await Device.findOne({
			where: {
				id: filter.id,
				isDeleted: false,
				teamId: filter.teamId
			}
		});

		if (!device) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'DEVICE_NOT_FOUND',
				message: 'Device not found.'
			});
		}

		return device.get({ plain: true });
	}

	async validateDevice(filter) {
		const device = await this.find(filter);

		if (!device) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'DEVICE_NOT_FOUND',
				message: 'Device not found.'
			});
		}
	}

	async update({ data, filter }) {
		await this.validateDevice(filter);
		await this.validateDeviceProvider({ data, meta: { teamId: filter.teamId } });
		await this.validateDeviceSerialKey({ serialKey: data.serialKey, providerId: data.providerId, teamId: filter.teamId });

		const device = await Device.update(data, {
			where: {
				id: filter.id,
				teamId: filter.teamId
			},
			raw: true,
			returning: true
		});

		return get(device, '[1][0]');
	}

	async remove({ filter, meta }) {
		await this.validateDevice(filter);

		await Device.update({ isDeleted: true, destroyerId: meta.loggedUserId }, {
			where: {
				id: filter.id,
				teamId: filter.teamId
			}
		});

		return true;
	}
}
