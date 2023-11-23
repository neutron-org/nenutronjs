import cosmosclient from '@cosmos-client/core';
import cosmwasmclient from '@cosmos-client/cosmwasm';
import { cosmos as AdminProto, ibc as ibcProto } from '../generated/ibc/proto';
import { neutron } from '../generated/proto';
import axios from 'axios';
import Long from 'long';
import { BlockWaiter, getWithAttempts } from './wait';
import {
  CosmosBaseV1beta1Coin,
  CosmosTxV1beta1GetTxResponse,
  BroadcastTx200ResponseTxResponse,
} from '@cosmos-client/core/cjs/openapi/api';
import { CosmosSDK } from '@cosmos-client/core/cjs/sdk';
import { ibc } from '@cosmos-client/ibc/cjs/proto';
import crypto from 'crypto';
import ICoin = cosmosclient.proto.cosmos.base.v1beta1.ICoin;
import IHeight = ibc.core.client.v1.IHeight;
import {
  AckFailuresResponse,
  ScheduleResponse,
  ChannelsList,
  PageRequest,
  PauseInfoResponse,
  CurrentPlanResponse,
  PinnedCodesResponse,
  IcaHostParamsResponse,
  Wallet,
  CodeId,
} from './types';
import { getContractBinary } from './env';
import { MsgTransfer } from '../generated/neutron/neutron/transfer/v1/tx_pb';
import { Height } from '../generated/neutron/ibc/core/client/v1/client_pb';
import { Message } from '@bufbuild/protobuf';

const adminmodule = AdminProto.adminmodule.adminmodule;

export const NEUTRON_DENOM = process.env.NEUTRON_DENOM || 'untrn';
export const IBC_ATOM_DENOM = process.env.IBC_ATOM_DENOM || 'uibcatom';
export const IBC_USDC_DENOM = process.env.IBC_USDC_DENOM || 'uibcusdc';
export const COSMOS_DENOM = process.env.COSMOS_DENOM || 'uatom';
export const IBC_RELAYER_NEUTRON_ADDRESS =
  'neutron1mjk79fjjgpplak5wq838w0yd982gzkyf8fxu8u';

// BalancesResponse is the response model for the bank balances query.
type BalancesResponse = {
  balances: ICoin[];
  pagination: {
    next_key: string;
    total: string;
  };
};

// DenomTraceResponse is the response model for the ibc transfer denom trace query.
type DenomTraceResponse = {
  path?: string;
  base_denom?: string;
};

export type TotalSupplyByDenomResponse = {
  amount: ICoin;
};

// TotalBurnedNeutronsAmountResponse is the response model for the feeburner's total-burned-neutrons.
export type TotalBurnedNeutronsAmountResponse = {
  total_burned_neutrons_amount: {
    coin: ICoin;
  };
};

export function registerCodecs() {
  cosmosclient.codec.register(
    '/cosmos.params.v1beta1.ParameterChangeProposal',
    cosmosclient.proto.cosmos.params.v1beta1.ParameterChangeProposal,
  );

  cosmosclient.codec.register(
    '/neutron.interchainqueries.MsgRemoveInterchainQueryRequest',
    neutron.interchainqueries.MsgRemoveInterchainQueryRequest,
  );
  cosmosclient.codec.register(
    '/cosmos.params.v1beta1.ParameterChangeProposal',
    cosmosclient.proto.cosmos.params.v1beta1.ParameterChangeProposal,
  );
  // cosmosclient.codec.register(
  //   '/ibc.applications.transfer.v1.MsgTransfer',
  //   ibcProto.applications.transfer.v1.MsgTransfer,
  // );
  cosmosclient.codec.register(
    '/cosmos.adminmodule.adminmodule.MsgSubmitProposal',
    adminmodule.MsgSubmitProposal,
  );
  cosmosclient.codec.register(
    '/ibc.lightclients.tendermint.v1.ClientState',
    ibcProto.lightclients.tendermint.v1.ClientState,
  );
}

export class CosmosWrapper {
  readonly sdk: cosmosclient.CosmosSDK;
  readonly blockWaiter: BlockWaiter;
  readonly denom: string;

  constructor(
    sdk: cosmosclient.CosmosSDK,
    blockWaiter: BlockWaiter,
    denom: string,
  ) {
    this.denom = denom;
    this.sdk = sdk;
    this.blockWaiter = blockWaiter;
  }

  async queryContractWithWait<T>(
    contract: string,
    query: Record<string, unknown>,
    numAttempts = 20,
  ): Promise<T> {
    while (numAttempts > 0) {
      const res: T = await this.queryContract<T>(contract, query).catch(
        () => null,
      );

      if (res !== null) {
        return res;
      }

      numAttempts--;
      await this.blockWaiter.waitBlocks(1);
    }

    throw new Error('failed to query contract');
  }

  async queryContract<T>(
    contract: string,
    query: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.sdk.url}/wasm/contract/${contract}/smart/${Buffer.from(
      JSON.stringify(query),
    ).toString('base64')}?encoding=base64`;
    const resp = await axios
      .get<{
        result: { smart: string };
        height: number;
      }>(url)
      .catch((error) => {
        if (error.response) {
          throw new Error(
            `Status: ${JSON.stringify(error.response.status)} \n` +
              `Response: ${JSON.stringify(error.response.data)} \n` +
              `Headers: ${JSON.stringify(error.response.headers)}`,
          );
        } else if (error.request) {
          throw new Error(error.request);
        }
        throw new Error('Error: ' + error.message);
      });
    return JSON.parse(
      Buffer.from(resp.data.result.smart, 'base64').toString(),
    ) as T;
  }

  async getContractInfo(contract: string): Promise<any> {
    const url = `${this.sdk.url}/cosmwasm/wasm/v1/contract/${contract}?encoding=base64`;
    try {
      const resp = await axios.get(url);
      return resp.data;
    } catch (e) {
      throw new Error(e.response?.data?.message);
    }
  }

  async getSeq(address: cosmosclient.AccAddress): Promise<any> {
    const account = await cosmosclient.rest.auth
      .account(this.sdk, address.toString()) // TODO: check
      .then((res) =>
        cosmosclient.codec.protoJSONToInstance(
          cosmosclient.codec.castProtoJSONOfProtoAny(res.data.account),
        ),
      )
      .catch((e) => {
        console.log(e);
        throw e;
      });

    if (!(account instanceof cosmosclient.proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw new Error("can't get account");
    }

    return account.sequence;
  }

  async queryInterchainqueriesParams(): Promise<any> {
    const req = await axios.get(
      `${this.sdk.url}/neutron/interchainqueries/params`,
    );

    return req.data;
  }

  async queryDelegations(delegatorAddr: cosmosclient.AccAddress): Promise<any> {
    const balances = await cosmosclient.rest.staking.delegatorDelegations(
      this.sdk,
      delegatorAddr,
    );
    return balances.data;
  }

  async queryBalances(addr: string): Promise<BalancesResponse> {
    const balances = await cosmosclient.rest.bank.allBalances(
      this.sdk,
      addr.toString(),
    );
    return balances.data as BalancesResponse;
  }

  async queryDenomBalance(
    addr: string | cosmosclient.AccAddress | cosmosclient.ValAddress,
    denom: string,
  ): Promise<number> {
    const { data } = await cosmosclient.rest.bank.allBalances(
      this.sdk,
      addr.toString(),
    );
    const balance = data.balances.find((b) => b.denom === denom);
    return parseInt(balance?.amount ?? '0', 10);
  }

  async queryDenomTrace(ibcDenom: string): Promise<DenomTraceResponse> {
    const data = axios.get<{ denom_trace: DenomTraceResponse }>(
      `${this.sdk.url}/ibc/apps/transfer/v1/denom_traces/${ibcDenom}`,
    );
    return data.then((res) => res.data.denom_trace);
  }

  async queryAckFailures(
    addr: string,
    pagination?: PageRequest,
  ): Promise<AckFailuresResponse> {
    try {
      const req = await axios.get<AckFailuresResponse>(
        `${this.sdk.url}/neutron/contractmanager/failures/${addr}`,
        { params: pagination },
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async listIBCChannels(): Promise<ChannelsList> {
    const res = await axios.get<ChannelsList>(
      `${this.sdk.url}/ibc/core/channel/v1/channels`,
    );
    return res.data;
  }

  async queryTotalBurnedNeutronsAmount(): Promise<TotalBurnedNeutronsAmountResponse> {
    try {
      const req = await axios.get<TotalBurnedNeutronsAmountResponse>(
        `${this.sdk.url}/neutron/feeburner/total_burned_neutrons_amount`,
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async queryTotalSupplyByDenom(
    denom: string,
  ): Promise<TotalSupplyByDenomResponse> {
    try {
      const req = await axios.get<TotalSupplyByDenomResponse>(
        `${this.sdk.url}/cosmos/bank/v1beta1/supply/${denom}`,
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async getChainAdmins() {
    const url = `${this.sdk.url}/cosmos/adminmodule/adminmodule/admins`;
    const resp = await axios.get<{
      admins: [string];
    }>(url);
    return resp.data.admins;
  }

  async queryPausedInfo(addr: string): Promise<PauseInfoResponse> {
    return await this.queryContract<PauseInfoResponse>(addr, {
      pause_info: {},
    });
  }

  async getWithAttempts<T>(
    getFunc: () => Promise<T>,
    readyFunc: (t: T) => Promise<boolean>,
    numAttempts = 20,
  ): Promise<T> {
    return await getWithAttempts(
      this.blockWaiter,
      getFunc,
      readyFunc,
      numAttempts,
    );
  }

  async getCodeDataHash(codeId: number): Promise<string> {
    try {
      const res = await axios.get(
        `${this.sdk.url}/cosmwasm/wasm/v1/code/${codeId}`,
      );
      return res.data.code_info.data_hash;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async querySchedules(pagination?: PageRequest): Promise<ScheduleResponse> {
    try {
      const req = await axios.get<ScheduleResponse>(
        `${this.sdk.url}/neutron/cron/schedule`,
        { params: pagination },
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async queryCurrentUpgradePlan(): Promise<CurrentPlanResponse> {
    try {
      const req = await axios.get<CurrentPlanResponse>(
        `${this.sdk.url}/cosmos/upgrade/v1beta1/current_plan`,
        {},
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async queryPinnedCodes(): Promise<PinnedCodesResponse> {
    try {
      const req = await axios.get<PinnedCodesResponse>(
        `${this.sdk.url}/cosmwasm/wasm/v1/codes/pinned`,
        {},
      );
      return req.data;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async queryHostEnabled(): Promise<boolean> {
    try {
      const req = await axios.get<IcaHostParamsResponse>(
        `${this.sdk.url}/ibc/apps/interchain_accounts/host/v1/params`,
        {},
      );
      return req.data.params.host_enabled;
    } catch (e) {
      if (e.response?.data?.message !== undefined) {
        throw new Error(e.response?.data?.message);
      }
      throw e;
    }
  }

  async queryContractAdmin(address: string): Promise<string> {
    const resp = await this.getContractInfo(address);
    return resp.contract_info.admin;
  }
}

export class WalletWrapper {
  readonly chain: CosmosWrapper;
  readonly wallet: Wallet;

  constructor(cw: CosmosWrapper, wallet: Wallet) {
    this.chain = cw;
    this.wallet = wallet;
  }

  async queryBalances(): Promise<BalancesResponse> {
    return await this.chain.queryBalances(this.wallet.address.toString());
  }

  async queryDenomBalance(denom: string): Promise<number> {
    return await this.chain.queryDenomBalance(
      this.wallet.address.toString(),
      denom,
    );
  }

  /**
   * execTx broadcasts messages and returns the transaction result.
   */
  async execTx<T>(
    fee: cosmosclient.proto.cosmos.tx.v1beta1.IFee,
    msgs: T[],
    numAttempts = 10,
    mode: cosmosclient.rest.tx.BroadcastTxMode = cosmosclient.rest.tx
      .BroadcastTxMode.Sync,
    sequence: number = this.wallet.account.sequence,
    txTimeoutHeight?: number,
  ): Promise<CosmosTxV1beta1GetTxResponse> {
    // console.log('before buildTx')
    const txBuilder = this.buildTx(fee, msgs, sequence, txTimeoutHeight);
    // console.log('before broadcastTx')
    const txhash = await this.broadcastTx(txBuilder, mode);
    // if (DEBUG_SUBMIT_TX) {
      // console.log('tx hash: ', txhash);
    // }
    let error = null;
    while (numAttempts > 0) {
      await this.chain.blockWaiter.waitBlocks(1);
      numAttempts--;
      const data = await cosmosclient.rest.tx
        .getTx(this.chain.sdk as CosmosSDK, txhash)
        .catch((reason) => {
          error = reason;
          return null;
        });
      if (data != null) {
        // if (DEBUG_SUBMIT_TX) {
          const code = +data.data?.tx_response.code;
        //   console.log('response code: ', code);
          // if (code > 0) {
            // console.log('\x1b[31m error log: ', data.data?.tx_response.raw_log);
          // }
          // console.log('response: ', JSON.stringify(data.data));
        // }
        return data.data;
      }
    }
    error = error ?? new Error('failed to submit tx');
    throw error;
  }

  /**
   * execTx broadcasts messages and returns the transaction result.
   */
  async execTxNew<T>(
    fee: cosmosclient.proto.cosmos.tx.v1beta1.IFee,
    msgs: cosmosclient.proto.google.protobuf.Any[],
    numAttempts = 10,
    mode: cosmosclient.rest.tx.BroadcastTxMode = cosmosclient.rest.tx
      .BroadcastTxMode.Sync,
    sequence: number = this.wallet.account.sequence,
    txTimeoutHeight?: number,
  ): Promise<CosmosTxV1beta1GetTxResponse> {
    const txBuilder = this.buildTxNew(fee, msgs, sequence, txTimeoutHeight);
    const txhash = await this.broadcastTx(txBuilder, mode);
    // if (DEBUG_SUBMIT_TX) {
      // console.log('tx hash: ', txhash);
    // }
    let error = null;
    while (numAttempts > 0) {
      await this.chain.blockWaiter.waitBlocks(1);
      numAttempts--;
      const data = await cosmosclient.rest.tx
        .getTx(this.chain.sdk as CosmosSDK, txhash)
        .catch((reason) => {
          error = reason;
          return null;
        });
      if (data != null) {
        // if (DEBUG_SUBMIT_TX) {
          const code = +data.data?.tx_response.code;
        //   console.log('response code: ', code);
          if (code > 0) {
            // console.log('\x1b[31m error log: ', data.data?.tx_response.raw_log);
          }
          // console.log('response: ', JSON.stringify(data.data));
        // }
        return data.data;
      }
    }
    error = error ?? new Error('failed to submit tx');
    throw error;
  }

  buildTx<T>(
    fee: cosmosclient.proto.cosmos.tx.v1beta1.IFee,
    msgs: T[],
    sequence: number = this.wallet.account.sequence,
    txTimeoutHeight?: number,
  ): cosmosclient.TxBuilder {
    const protoMsgs: Array<cosmosclient.proto.google.protobuf.IAny> = [];
    msgs.forEach((msg) => {
      protoMsgs.push(cosmosclient.codec.instanceToProtoAny(msg));
    });
    const txBody = new cosmosclient.proto.cosmos.tx.v1beta1.TxBody({
      messages: protoMsgs,
    });
    if (txTimeoutHeight != undefined) {
      txBody.timeout_height = txTimeoutHeight;
    }
    const authInfo = new cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.instanceToProtoAny(this.wallet.pubKey),
          mode_info: {
            single: {
              mode: cosmosclient.proto.cosmos.tx.signing.v1beta1.SignMode
                .SIGN_MODE_DIRECT,
            },
          },
          sequence,
        },
      ],
      fee,
    });
    const txBuilder = new cosmosclient.TxBuilder(
      this.chain.sdk as CosmosSDK,
      txBody,
      authInfo,
    );
    const signDocBytes = txBuilder.signDocBytes(
      this.wallet.account.account_number,
    );
    txBuilder.addSignature(this.wallet.privKey.sign(signDocBytes));
    return txBuilder;
  }

  buildTxNew<T>(
    fee: cosmosclient.proto.cosmos.tx.v1beta1.IFee,
    protoMsgs: cosmosclient.proto.google.protobuf.Any[],
    sequence: number = this.wallet.account.sequence,
    txTimeoutHeight?: number,
  ): cosmosclient.TxBuilder {
    const txBody = new cosmosclient.proto.cosmos.tx.v1beta1.TxBody({
      messages: protoMsgs,
    });
    if (txTimeoutHeight != undefined) {
      txBody.timeout_height = txTimeoutHeight;
    }
    const authInfo = new cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.instanceToProtoAny(this.wallet.pubKey),
          mode_info: {
            single: {
              mode: cosmosclient.proto.cosmos.tx.signing.v1beta1.SignMode
                .SIGN_MODE_DIRECT,
            },
          },
          sequence,
        },
      ],
      fee,
    });
    const txBuilder = new cosmosclient.TxBuilder(
      this.chain.sdk as CosmosSDK,
      txBody,
      authInfo,
    );
    const signDocBytes = txBuilder.signDocBytes(
      this.wallet.account.account_number,
    );
    txBuilder.addSignature(this.wallet.privKey.sign(signDocBytes));
    return txBuilder;
  }

  async broadcastTx(
    txBuilder: cosmosclient.TxBuilder,
    mode: cosmosclient.rest.tx.BroadcastTxMode = cosmosclient.rest.tx
      .BroadcastTxMode.Sync,
  ): Promise<string> {
    try {
    // if (DEBUG_SUBMIT_TX) {
    //   console.log('\n\n\nStart broadcasting tx: ----------------------');
      try {
        // console.log(JSON.stringify(txBuilder.toProtoJSON()));
      } catch (error) {
        // console.log('failed to serrialize tx');
      }
    // }

      const res = await cosmosclient.rest.tx.broadcastTx(
        this.chain.sdk as CosmosSDK,
        {
          tx_bytes: txBuilder.txBytes(),
          mode,
        },
      );

    const code = res.data?.tx_response.code;
    // if (DEBUG_SUBMIT_TX) {
    //   console.log('async response code: ', code);
    // }
    if (code !== 0) {
      // if (DEBUG_SUBMIT_TX) {
      //   console.log(`broadcast error: ${res.data?.tx_response.raw_log}`);
      // }
      throw new Error(`broadcast error: ${res.data?.tx_response.raw_log}`);
    }
    const txhash = res.data?.tx_response.txhash;
    this.wallet.account.sequence++;
    return txhash;

    } catch (e) {
      console.log('broadcast error: ' + JSON.stringify(e));
      throw e;
    }
  }


  // storeWasm stores the wasm code by the passed path on the blockchain.
  async storeWasm(fileName: string): Promise<CodeId> {
    const msg = new cosmwasmclient.proto.cosmwasm.wasm.v1.MsgStoreCode({
      sender: this.wallet.address.toString(),
      wasm_byte_code: await getContractBinary(fileName),
      instantiate_permission: null,
    });
    const data = await this.execTx(
      {
        amount: [{ denom: NEUTRON_DENOM, amount: '250000' }],
        gas_limit: Long.fromString('60000000'),
      },
      [msg],
    );

    if (data.tx_response.code !== 0) {
      throw new Error(`upload error: ${data.tx_response.raw_log}`);
    }

    const attributes = getEventAttributesFromTx(data, 'store_code', [
      'code_id',
    ]);

    return parseInt(attributes[0].code_id);
  }

  async instantiateContract(
    codeId: number,
    msg: string,
    label: string,
    admin: string = this.wallet.address.toString(),
  ): Promise<Array<Record<string, string>>> {
    const msgInit = new cosmwasmclient.proto.cosmwasm.wasm.v1.MsgInstantiateContract({
      code_id: new Long(codeId),
      sender: this.wallet.address.toString(),
      admin: admin,
      label,
      msg: Buffer.from(msg),
    });

    const data = await this.execTx(
      {
        amount: [{ denom: NEUTRON_DENOM, amount: '2000000' }],
        gas_limit: Long.fromString('600000000'),
      },
      [msgInit],
      10,
      cosmosclient.rest.tx.BroadcastTxMode.Async,
    );

    if (data.tx_response.code !== 0) {
      throw new Error(`instantiate error: ${data.tx_response.raw_log}`);
    }

    return getEventAttributesFromTx(data, 'instantiate', [
      '_contract_address',
      'code_id',
    ]);
  }

  async migrateContract(
    contract: string,
    codeId: number,
    msg: string | Record<string, unknown>,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const sender = this.wallet.address.toString();
    const msgMigrate = new cosmwasmclient.proto.cosmwasm.wasm.v1.MsgMigrateContract({
      sender,
      contract,
      code_id: new Long(codeId),
      msg: Buffer.from(typeof msg === 'string' ? msg : JSON.stringify(msg)),
    });
    const res = await this.execTx(
      {
        gas_limit: Long.fromString('5000000'),
        amount: [{ denom: this.chain.denom, amount: '20000' }],
      },
      [msgMigrate],
    );
    if (res.tx_response.code !== 0) {
      throw new Error(
        `${res.tx_response.raw_log}\nFailed tx hash: ${res.tx_response.txhash}`,
      );
    }
    return res?.tx_response;
  }

  async executeContract(
    contract: string,
    msg: string,
    funds: cosmosclient.proto.cosmos.base.v1beta1.ICoin[] = [],
    fee = {
      gas_limit: Long.fromString('4000000'),
      amount: [{ denom: this.chain.denom, amount: '10000' }],
    },
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const sender = this.wallet.address.toString();
    const msgExecute = new cosmwasmclient.proto.cosmwasm.wasm.v1.MsgExecuteContract({
      sender,
      contract,
      msg: Buffer.from(msg),
      funds,
    });

    const res = await this.execTx(fee, [msgExecute]);
    if (res.tx_response.code !== 0) {
      throw new Error(
        `${res.tx_response.raw_log}\nFailed tx hash: ${res.tx_response.txhash}`,
      );
    }
    return res?.tx_response;
  }

  /**
   * msgSend processes a transfer, waits two blocks and returns the tx hash.
   */
  async msgSend(
    to: string,
    coin:
      | {
          amount: string;
          denom?: string;
        }
      | string,
    fee = {
      gas_limit: Long.fromString('200000'),
      amount: [{ denom: this.chain.denom, amount: '1000' }],
    },
    sequence = this.wallet.account.sequence,
    mode: cosmosclient.rest.tx.BroadcastTxMode = cosmosclient.rest.tx.BroadcastTxMode.Async,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const { amount, denom = this.chain.denom } =
      typeof coin === 'string' ? { amount: coin } : coin;
    const msgSend = new cosmosclient.proto.cosmos.bank.v1beta1.MsgSend({
      from_address: this.wallet.address.toString(),
      to_address: to,
      amount: [{ denom, amount }],
    });
    const res = await this.execTx(fee, [msgSend], 10, mode, sequence);
    return res?.tx_response;
  }

  async msgSendDirectProposal(
    subspace: string,
    key: string,
    value: string,
    fee = {
      gas_limit: Long.fromString('200000'),
      amount: [{ denom: this.chain.denom, amount: '1000' }],
    },
    sequence = this.wallet.account.sequence,
    mode: cosmosclient.rest.tx.BroadcastTxMode = cosmosclient.rest.tx.BroadcastTxMode.Async,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const msg = new adminmodule.MsgSubmitProposal({
      content: cosmosclient.codec.instanceToProtoAny(
        new cosmosclient.proto.cosmos.params.v1beta1.ParameterChangeProposal({
          title: 'mock',
          description: 'mock',
          changes: [
            new cosmosclient.proto.cosmos.params.v1beta1.ParamChange({
              key: key,
              subspace: subspace,
              value: value,
            }),
          ],
        }),
      ),
      proposer: this.wallet.account.address,
    });
    const res = await this.execTx(fee, [msg], 10, mode, sequence);
    return res?.tx_response;
  }

  /* simulateFeeBurning simulates fee burning via send tx.
   */
  async simulateFeeBurning(
    amount: number,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const msgSend = new cosmosclient.proto.cosmos.bank.v1beta1.MsgSend({
      from_address: this.wallet.address.toString(),
      to_address: this.wallet.address.toString(),
      amount: [{ denom: this.chain.denom, amount: '1' }],
    });
    const res = await this.execTx(
      {
        gas_limit: Long.fromString('200000'),
        amount: [
          {
            denom: this.chain.denom,
            amount: `${Math.ceil((1000 * amount) / 750)}`,
          },
        ],
      },
      [msgSend],
    );
    return res?.tx_response;
  }

  /**
   * msgRemoveInterchainQuery sends transaction to remove interchain query, waits two blocks and returns the tx hash.
   */
  async msgRemoveInterchainQuery(
    queryId: number,
    sender: string,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const msgRemove =
      new neutron.interchainqueries.MsgRemoveInterchainQueryRequest({
        query_id: new Long(queryId),
        sender,
      });

    const res = await this.execTx(
      {
        gas_limit: Long.fromString('200000'),
        amount: [{ denom: this.chain.denom, amount: '1000' }],
      },
      [msgRemove],
    );
    return res?.tx_response;
  }

  /**
   * msgSend processes an IBC transfer, waits two blocks and returns the tx hash.
   */
  async msgIBCTransfer(
    sourcePort: string,
    sourceChannel: string,
    token: ICoin,
    receiver: string,
    timeoutHeight: IHeight,
    memo?: string,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    console.log('New transfer');
    const newMsgSend = new MsgTransfer({
      sourcePort: sourcePort,
      sourceChannel: sourceChannel,
      token: token,
      sender: this.wallet.address.toString(),
      receiver: receiver,
      timeoutHeight: new Height({
        revisionHeight: timeoutHeight.revision_height,
        revisionNumber: timeoutHeight.revision_number,
      }),
      memo: memo,
    });
    // newMsgSend.memo = memo; // TODO: check if needed

    const res = await this.execTxNew(
      {
        gas_limit: Long.fromString('200000'),
        amount: [{ denom: this.chain.denom, amount: '1000' }],
      },
      [packAnyMsg('/ibc.applications.transfer.v1.MsgTransfer', newMsgSend)],
    );
    return res?.tx_response;
  }

  async msgDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: string,
  ): Promise<BroadcastTx200ResponseTxResponse> {
    const msgDelegate = new cosmosclient.proto.cosmos.staking.v1beta1.MsgDelegate({
      delegator_address: delegatorAddress,
      validator_address: validatorAddress,
      amount: { denom: this.chain.denom, amount: amount },
    });
    const res = await this.execTx(
      {
        gas_limit: Long.fromString('200000'),
        amount: [{ denom: this.chain.denom, amount: '1000' }],
      },
      [msgDelegate],
    );
    return res?.tx_response;
  }
}

type TxResponseType = Awaited<ReturnType<typeof cosmosclient.rest.tx.getTx>>;

export const getEventAttributesFromTx = (
  data: TxResponseType['data'],
  event: string,
  attributes: string[],
): Array<
  Record<(typeof attributes)[number], string> | Record<string, never>
> => {
  const events =
    (
      JSON.parse(data?.tx_response.raw_log) as [
        {
          events: [
            { type: string; attributes: [{ key: string; value: string }] },
          ];
        },
      ]
    )[0].events || [];
  const resp = [];
  for (const e of events) {
    if (event === e.type) {
      let out = {};
      for (const a of e.attributes) {
        if (attributes.includes(a.key)) {
          out[a.key] = a.value;
        }
        if (Object.keys(out).length == attributes.length) {
          resp.push(out);
          out = {};
        }
      }
    }
  }
  return resp;
};

export const mnemonicToWallet = async (
  walletType: {
    fromPublicKey: (
      k: cosmosclient.PubKey,
    ) => cosmosclient.AccAddress | cosmosclient.ValAddress;
  },
  sdk: cosmosclient.CosmosSDK,
  mnemonic: string,
  addrPrefix: string,
  validate = true,
): Promise<Wallet> => {
  const privKey = new cosmosclient.proto.cosmos.crypto.secp256k1.PrivKey({
    key: await cosmosclient.generatePrivKeyFromMnemonic(mnemonic),
  });

  const pubKey = privKey.pubKey();
  let account = null;
  cosmosclient.config.setBech32Prefix({
    accAddr: addrPrefix,
    accPub: `${addrPrefix}pub`,
    valAddr: `${addrPrefix}valoper`,
    valPub: `${addrPrefix}valoperpub`,
    consAddr: `${addrPrefix}valcons`,
    consPub: `${addrPrefix}valconspub`,
  });
  const address = walletType.fromPublicKey(pubKey);
  // eslint-disable-next-line no-prototype-builtins
  if (cosmosclient.ValAddress !== walletType && validate) {
    account = await cosmosclient.rest.auth
      .account(sdk, address.toString())
      .then((res) =>
        cosmosclient.codec.protoJSONToInstance(
          cosmosclient.codec.castProtoJSONOfProtoAny(res.data.account),
        ),
      )
      .catch((e) => {
        throw e;
      });

    if (!(account instanceof cosmosclient.proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw new Error("can't get account");
    }
  }
  return new Wallet(address, account, pubKey, privKey, addrPrefix);
};

export const getSequenceId = (rawLog: string | undefined): number => {
  if (!rawLog) {
    throw 'getSequenceId: empty rawLog';
  }
  const events = JSON.parse(rawLog)[0]['events'];
  const sequence = events
    .find((e) => e['type'] === 'send_packet')
    ['attributes'].find((a) => a['key'] === 'packet_sequence').value;
  return +sequence;
};

export const getIBCDenom = (portName, channelName, denom: string): string => {
  const uatomIBCHash = crypto
    .createHash('sha256')
    .update(`${portName}/${channelName}/${denom}`)
    .digest('hex')
    .toUpperCase();
  return `ibc/${uatomIBCHash}`;
};

export const createBankMessage = (
  addr: string,
  amount: number,
  denom: string,
) => ({
  bank: {
    send: {
      to_address: addr,
      amount: [
        {
          denom: denom,
          amount: amount.toString(),
        },
      ],
    },
  },
});

export const getEventAttribute = (
  events: { type: string; attributes: { key: string; value: string }[] }[],
  eventType: string,
  attribute: string,
): string => {
  const attributes = events
    .filter((event) => event.type === eventType)
    .map((event) => event.attributes)
    .flat();

  const encodedAttr = attributes?.find(
    (attr) => attr.key === Buffer.from(attribute).toString('base64'),
  )?.value as string;

  if (!encodedAttr) {
    throw new Error(`Attribute ${attribute} not found`);
  }

  return Buffer.from(encodedAttr, 'base64').toString('ascii');
};

export const filterIBCDenoms = (list: CosmosBaseV1beta1Coin[]) =>
  list.filter(
    (coin) =>
      coin.denom && ![IBC_ATOM_DENOM, IBC_USDC_DENOM].includes(coin.denom),
  );

export const wrapMsg = (x) => Buffer.from(JSON.stringify(x)).toString('base64');

export const packAnyMsg = (typeUrl: string, msg: Message): cosmosclient.proto.google.protobuf.Any => {
  return new cosmosclient.proto.google.protobuf.Any({ type_url: typeUrl, value: msg.toBinary() })
}
