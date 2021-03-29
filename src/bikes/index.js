import {FlywheelBikeClient} from './flywheel';
import {PelotonBikeClient} from './peloton';
import {Ic4BikeClient} from './ic4';
import {KeiserBikeClient} from './keiser';
import {EchelonBikeClient} from './echelon';
import {EchelonBikeClient2} from './echelon2';
import {EchelonBikeClient3} from './echelon3';
import {BotBikeClient} from './bot';
import {macAddress} from '../util/mac-address';
import fs from 'fs';

const factories = {
  'flywheel': createFlywheelBikeClient,
  'peloton': createPelotonBikeClient,
  'ic4': createIc4BikeClient,
  'keiser': createKeiserBikeClient,
  'echelon': createEchelonBikeClient,
  'echelon2': createEchelonBikeClient2,
  'echelon3': createEchelonBikeClient3,
  'bot': createBotBikeClient,
  'autodetect': autodetectBikeClient,
};

export function getBikeTypes() {
  return Object.keys(factories);
}

export function createBikeClient(options, noble) {
  const {bike} = options;
  const factory = factories[bike];
  if (!factory) {
    throw new Error(`unrecognized bike type ${bike}`);
  }
  return factory(options, noble);
}

function createFlywheelBikeClient(options, noble) {
  const filters = {};
  if (options.flywheelAddress) {
    filters.address = (v) => v == macAddress(options.flywheelAddress);
  }
  if (options.flywheelName) {
    filters.name = (v) => new RegExp(options.flywheelName).test(v);
  }
  process.env['NOBLE_HCI_DEVICE_ID'] = options.flywheelAdapter;
  return new FlywheelBikeClient(noble, filters);
}

function createPelotonBikeClient(options, noble) {
  const {pelotonPath} = options;
  return new PelotonBikeClient(pelotonPath);
}

function createIc4BikeClient(options, noble) {
  return new Ic4BikeClient(noble);
}

function createKeiserBikeClient(options, noble) {
  return new KeiserBikeClient(noble);
}

function createEchelonBikeClient(options, noble) {
  return new EchelonBikeClient(noble);
}

function createEchelonBikeClient2(options, noble) {
  return new EchelonBikeClient2(noble);
}

function createEchelonBikeClient3(options, noble) {
  return new EchelonBikeClient3(noble);
}

function createBotBikeClient(options, noble) {
  const args = [
    options.botPower,
    options.botCadence,
    options.botHost,
    options.botPort,
  ]
  return new BotBikeClient(...args);
}

function autodetectBikeClient(options, noble) {
  if (fs.existsSync(options.pelotonPath)) {
    return createPelotonBikeClient(options, noble);
  }
  return createFlywheelBikeClient(options, noble);
}
