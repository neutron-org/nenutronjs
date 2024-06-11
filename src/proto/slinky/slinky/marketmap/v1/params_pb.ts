// @generated by protoc-gen-es v1.4.2 with parameter "target=ts"
// @generated from file slinky/marketmap/v1/params.proto (package slinky.marketmap.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, protoInt64 } from "@bufbuild/protobuf";

/**
 * Params defines the parameters for the x/marketmap module.
 *
 * @generated from message slinky.marketmap.v1.Params
 */
export class Params extends Message<Params> {
  /**
   * MarketAuthority is the authority account that is able to control updating
   * the marketmap.
   *
   * @generated from field: string market_authority = 1;
   */
  marketAuthority = "";

  /**
   * Version is the schema version for the MarketMap data structure and query
   * response.
   *
   * @generated from field: uint64 version = 2;
   */
  version = protoInt64.zero;

  constructor(data?: PartialMessage<Params>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.marketmap.v1.Params";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "market_authority", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "version", kind: "scalar", T: 4 /* ScalarType.UINT64 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Params {
    return new Params().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Params {
    return new Params().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Params {
    return new Params().fromJsonString(jsonString, options);
  }

  static equals(a: Params | PlainMessage<Params> | undefined, b: Params | PlainMessage<Params> | undefined): boolean {
    return proto3.util.equals(Params, a, b);
  }
}

