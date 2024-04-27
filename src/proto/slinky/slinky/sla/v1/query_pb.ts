// @generated by protoc-gen-es v1.4.2 with parameter "target=ts"
// @generated from file slinky/sla/v1/query.proto (package slinky.sla.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { Params, PriceFeed, PriceFeedSLA } from "./genesis_pb.js";

/**
 * QueryAllSLAsRequest is the request type for the Query/GetAllSLAs RPC method.
 *
 * @generated from message slinky.sla.v1.GetAllSLAsRequest
 */
export class GetAllSLAsRequest extends Message<GetAllSLAsRequest> {
  constructor(data?: PartialMessage<GetAllSLAsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.GetAllSLAsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetAllSLAsRequest {
    return new GetAllSLAsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetAllSLAsRequest {
    return new GetAllSLAsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetAllSLAsRequest {
    return new GetAllSLAsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetAllSLAsRequest | PlainMessage<GetAllSLAsRequest> | undefined, b: GetAllSLAsRequest | PlainMessage<GetAllSLAsRequest> | undefined): boolean {
    return proto3.util.equals(GetAllSLAsRequest, a, b);
  }
}

/**
 * QueryAllSLAsResponse is the response type for the Query/GetAllSLAs RPC
 * method.
 *
 * @generated from message slinky.sla.v1.GetAllSLAsResponse
 */
export class GetAllSLAsResponse extends Message<GetAllSLAsResponse> {
  /**
   * @generated from field: repeated slinky.sla.v1.PriceFeedSLA slas = 1;
   */
  slas: PriceFeedSLA[] = [];

  constructor(data?: PartialMessage<GetAllSLAsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.GetAllSLAsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "slas", kind: "message", T: PriceFeedSLA, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetAllSLAsResponse {
    return new GetAllSLAsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetAllSLAsResponse {
    return new GetAllSLAsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetAllSLAsResponse {
    return new GetAllSLAsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetAllSLAsResponse | PlainMessage<GetAllSLAsResponse> | undefined, b: GetAllSLAsResponse | PlainMessage<GetAllSLAsResponse> | undefined): boolean {
    return proto3.util.equals(GetAllSLAsResponse, a, b);
  }
}

/**
 * QueryGetPriceFeedsRequest is the request type for the Query/GetPriceFeeds RPC
 * method.
 *
 * @generated from message slinky.sla.v1.GetPriceFeedsRequest
 */
export class GetPriceFeedsRequest extends Message<GetPriceFeedsRequest> {
  /**
   * ID defines the SLA to query price feeds for.
   *
   * @generated from field: string id = 1;
   */
  id = "";

  constructor(data?: PartialMessage<GetPriceFeedsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.GetPriceFeedsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetPriceFeedsRequest {
    return new GetPriceFeedsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetPriceFeedsRequest {
    return new GetPriceFeedsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetPriceFeedsRequest {
    return new GetPriceFeedsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetPriceFeedsRequest | PlainMessage<GetPriceFeedsRequest> | undefined, b: GetPriceFeedsRequest | PlainMessage<GetPriceFeedsRequest> | undefined): boolean {
    return proto3.util.equals(GetPriceFeedsRequest, a, b);
  }
}

/**
 * QueryGetPriceFeedsResponse is the response type for the Query/GetPriceFeeds
 * RPC method.
 *
 * @generated from message slinky.sla.v1.GetPriceFeedsResponse
 */
export class GetPriceFeedsResponse extends Message<GetPriceFeedsResponse> {
  /**
   * PriceFeeds defines the price feeds for the given SLA.
   *
   * @generated from field: repeated slinky.sla.v1.PriceFeed price_feeds = 1;
   */
  priceFeeds: PriceFeed[] = [];

  constructor(data?: PartialMessage<GetPriceFeedsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.GetPriceFeedsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "price_feeds", kind: "message", T: PriceFeed, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetPriceFeedsResponse {
    return new GetPriceFeedsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetPriceFeedsResponse {
    return new GetPriceFeedsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetPriceFeedsResponse {
    return new GetPriceFeedsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetPriceFeedsResponse | PlainMessage<GetPriceFeedsResponse> | undefined, b: GetPriceFeedsResponse | PlainMessage<GetPriceFeedsResponse> | undefined): boolean {
    return proto3.util.equals(GetPriceFeedsResponse, a, b);
  }
}

/**
 * QueryParamsRequest is the request type for the Query/Params RPC method.
 *
 * @generated from message slinky.sla.v1.ParamsRequest
 */
export class ParamsRequest extends Message<ParamsRequest> {
  constructor(data?: PartialMessage<ParamsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.ParamsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ParamsRequest {
    return new ParamsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ParamsRequest {
    return new ParamsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ParamsRequest {
    return new ParamsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: ParamsRequest | PlainMessage<ParamsRequest> | undefined, b: ParamsRequest | PlainMessage<ParamsRequest> | undefined): boolean {
    return proto3.util.equals(ParamsRequest, a, b);
  }
}

/**
 * QueryParamsResponse is the response type for the Query/Params RPC method.
 *
 * @generated from message slinky.sla.v1.ParamsResponse
 */
export class ParamsResponse extends Message<ParamsResponse> {
  /**
   * @generated from field: slinky.sla.v1.Params params = 1;
   */
  params?: Params;

  constructor(data?: PartialMessage<ParamsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "slinky.sla.v1.ParamsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "params", kind: "message", T: Params },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ParamsResponse {
    return new ParamsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ParamsResponse {
    return new ParamsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ParamsResponse {
    return new ParamsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: ParamsResponse | PlainMessage<ParamsResponse> | undefined, b: ParamsResponse | PlainMessage<ParamsResponse> | undefined): boolean {
    return proto3.util.equals(ParamsResponse, a, b);
  }
}

