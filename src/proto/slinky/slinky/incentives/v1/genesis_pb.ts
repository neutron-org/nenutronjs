// @generated by protoc-gen-es v1.4.2 with parameter "target=ts"
// @generated from file slinky/incentives/v1/genesis.proto (package slinky.incentives.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * GenesisState is the genesis-state for the x/incentives module.
 *
 * @generated from message slinky.incentives.v1.GenesisState
 */
export class GenesisState extends Message<GenesisState> {
  /**
   * Registry is a list of incentives by type. The registry defined here
   * should be a subset of the incentive types defined in the incentive
   * module (keeper).
   *
   * @generated from field: repeated slinky.incentives.v1.IncentivesByType registry = 1;
   */
  registry: IncentivesByType[] = [];

  constructor(data?: PartialMessage<GenesisState>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.incentives.v1.GenesisState";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "registry", kind: "message", T: IncentivesByType, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GenesisState {
    return new GenesisState().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GenesisState {
    return new GenesisState().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GenesisState {
    return new GenesisState().fromJsonString(jsonString, options);
  }

  static equals(a: GenesisState | PlainMessage<GenesisState> | undefined, b: GenesisState | PlainMessage<GenesisState> | undefined): boolean {
    return proto3.util.equals(GenesisState, a, b);
  }
}

/**
 * IncentivesByType encapsulates a list of incentives by type. Each of the
 * entries here must correspond to the same incentive type defined here.
 *
 * @generated from message slinky.incentives.v1.IncentivesByType
 */
export class IncentivesByType extends Message<IncentivesByType> {
  /**
   * IncentiveType is the incentive type i.e. (BadPriceIncentiveType,
   * GoodPriceIncentiveType).
   *
   * @generated from field: string incentive_type = 1;
   */
  incentiveType = "";

  /**
   * Entries is a list of incentive bytes.
   *
   * @generated from field: repeated bytes entries = 2;
   */
  entries: Uint8Array[] = [];

  constructor(data?: PartialMessage<IncentivesByType>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.incentives.v1.IncentivesByType";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "incentive_type", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "entries", kind: "scalar", T: 12 /* ScalarType.BYTES */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IncentivesByType {
    return new IncentivesByType().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IncentivesByType {
    return new IncentivesByType().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IncentivesByType {
    return new IncentivesByType().fromJsonString(jsonString, options);
  }

  static equals(a: IncentivesByType | PlainMessage<IncentivesByType> | undefined, b: IncentivesByType | PlainMessage<IncentivesByType> | undefined): boolean {
    return proto3.util.equals(IncentivesByType, a, b);
  }
}

