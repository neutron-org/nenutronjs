import { Coin } from '@cosmjs/proto-signing';
import { ADMIN_MODULE_ADDRESS } from './constants';
import { MsgExecuteContract } from '@neutron-org/neutronjs/neutron/cron/schedule';
import { ConsumerParams } from '@neutron-org/neutronjs/interchain_security/ccv/v1/shared_consumer';

export type ParamChangeProposalInfo = {
  title: string;
  description: string;
  subspace: string;
  key: string;
  value: string;
};

export type PinCodesInfo = {
  title: string;
  description: string;
  codes_ids: number[];
};

export type ParamsInterchaintxsInfo = {
  msg_submit_tx_max_messages: number;
};

export type ParamsRateLimitInfo = {
  contract_address: string;
};

export type ParamsInterchainqueriesInfo = {
  query_submit_timeout: number;
  query_deposit: Coin[];
  tx_query_removal_limit: number;
  max_kv_query_keys_count: number;
  max_transactions_filters: number;
};

export type WhitelistedHook = {
  code_id: number;
  denom_creator: string;
};
export type ParamsTokenfactoryInfo = {
  denom_creation_fee: any;
  denom_creation_gas_consume: number;
  fee_collector_address: string;
  whitelisted_hooks: WhitelistedHook[];
};

export type ParamsFeeburnerInfo = {
  treasury_address: string;
};

export type ParamsTransferInfo = {
  send_enabled: boolean;
  receive_enabled: boolean;
};

export type ParamsFeerefunderInfo = {
  min_fee: {
    recv_fee: any;
    ack_fee: any;
    timeout_fee: any;
  };
};

export type ParamsGlobalfeeInfo = {
  minimum_gas_prices: Coin[];
  bypass_min_fee_msg_types: string[];
  max_total_bypass_min_fee_msg_gas_usage: string;
};

export type ParamsCronInfo = {
  security_address: string;
  limit: number;
};

export type ParamsDexInfo = {
  fee_tiers: number[];
  paused: boolean;
  max_jits_per_block: number;
  good_til_purge_allowance: number;
};

export type ParamsContractmanagerInfo = {
  sudo_call_gas_limit: string;
};

export type UpdateAdmin = {
  sender: string;
  contract: string;
  new_admin: string;
};

export type ClearAdmin = {
  sender: string;
  contract: string;
};

export type ClientUpdateInfo = {
  title: string;
  description: string;
  subject_client_id: string;
  substitute_client_id;
};

export type UpgradeInfo = {
  title: string;
  description: string;
  name: string;
  height: number;
  info: string;
  upgraded_client_state: {
    type_url: string;
    value: string;
  };
};

export type CurrencyPairInfo = {
  Base: string;
  Quote: string;
};

export type SendProposalInfo = {
  to: string;
  denom: string;
  amount: string;
};

export type MultiChoiceProposal = {
  // Title  of the proposal
  readonly title: string;
  // Description of the proposal
  readonly description: string;
  // The address that created this proposal.
  readonly proposer: string;
  // The block height at which this proposal was created. Voting
  // power queries should query for voting power at this block
  // height.
  readonly start_height: number;
  // The minimum amount of time this proposal must remain open for
  // voting. The proposal may not pass unless this is expired or
  // None.
  readonly min_voting_period: {
    at_height: number;
    at_time: number;
    never: any;
  };
  // The the time at which this proposal will expire and close for
  // additional votes.
  readonly expiration: {
    at_height: number;
    at_time: number;
    never: any;
  };
  // The options to be chosen from in the vote.
  readonly choices: CheckedMultipleChoiceOption[];
  // Proposal status (Open, rejected, executed, execution failed, closed, passed)
  readonly status:
    | 'open'
    | 'rejected'
    | 'passed'
    | 'executed'
    | 'closed'
    | 'execution_failed';
  // Voting settings (threshold, quorum, etc.)
  readonly voting_strategy: VotingStrategy;
  // The total power when the proposal started (used to calculate percentages)
  readonly total_power: string;
  // The vote tally.
  readonly votes: MultipleChoiceVotes;
  // Whether DAO members are allowed to change their votes.
  // When disabled, proposals can be executed as soon as they pass.
  // When enabled, proposals can only be executed after the voting
  // period has ended and the proposal passed.
  readonly allow_revoting: boolean;
};

export type CheckedMultipleChoiceOption = {
  readonly index: number;
  readonly option_type: MultipleChoiceOptionType;
  readonly description: string;
  // readonly msgs: Option<Vec<CosmosMsg<NeutronMsg>>>,
  readonly vote_count: string;
};

export type VotingStrategy = {
  single_choice: {
    quorum: {
      majority: any;
      percent: string;
    };
  };
};

export type MultipleChoiceVotes = {
  vote_weights: string[];
};

export type ChainManagerStrategy = {
  address: string;
  permissions: any[];
};

export type DynamicFeesParams = {
  ntrn_prices: Array<DecCoin>;
};

export type ConsensusParams = {
  block: {
    max_gas: number;
    max_bytes: number;
  };
  evidence: {
    max_age_num_blocks: number;
    max_age_duration: string; // Duration
    max_bytes: number;
  };
  validator: {
    pub_key_types: string[];
  };
  abci?: {
    vote_extensions_enable_height: number;
  };
};

export type DecCoin = {
  denom: string;
  amount: string;
};

export type FeeMarketParams = {
  // Alpha is the amount we additively increase the learning rate
  // when it is above or below the target +/- threshold.
  alpha: string; // Dec

  // Beta is the amount we multiplicatively decrease the learning rate
  // when it is within the target +/- threshold.
  beta: string; // Dec

  // Delta is the amount we additively increase/decrease the base fee when the
  // net block utilization difference in the window is above/below the target
  // utilization.
  delta: string; // Dec

  // MinBaseGasPrice determines the initial gas price of the module and the global
  // minimum for the network.
  min_base_gas_price: string; // Dec

  // MinLearningRate is the lower bound for the learning rate.
  min_learning_rate: string; // Dec

  // MaxLearningRate is the upper bound for the learning rate.
  max_learning_rate: string; // Dec

  // MaxBlockUtilization is the maximum block utilization.
  max_block_utilization: number;

  // Window defines the window size for calculating an adaptive learning rate
  // over a moving window of blocks.
  window: number;

  // FeeDenom is the denom that will be used for all fee payments.
  fee_denom: string;

  // Enabled is a boolean that determines whether the EIP1559 fee market is
  // enabled.
  enabled: boolean;

  // DistributeFees is a boolean that determines whether the fees are burned or
  // distributed to all stakers.
  distribute_fees: boolean;
};

// 'none' is a choice that represents selecting none of the options; still counts toward quorum
// and allows proposals with all bad options to be voted against.
export type MultipleChoiceOptionType = 'none' | 'standard';

export const paramChangeProposal = (
  info: ParamChangeProposalInfo,
  chainManagerAddress: string,
): any => ({
  wasm: {
    execute: {
      contract_addr: chainManagerAddress,
      msg: Buffer.from(
        JSON.stringify({
          execute_messages: {
            messages: [
              {
                custom: {
                  submit_admin_proposal: {
                    admin_proposal: {
                      param_change_proposal: {
                        title: info.title,
                        description: info.description,
                        param_changes: [
                          {
                            subspace: info.subspace,
                            key: info.key,
                            value: info.value,
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        }),
      ).toString('base64'),
      funds: [],
    },
  },
});

export const pinCodesProposal = (info: PinCodesInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmwasm.wasm.v1.MsgPinCodes',
            authority: ADMIN_MODULE_ADDRESS,
            code_ids: info.codes_ids,
          }),
        },
      },
    },
  },
});

export const pinCodesCustomAuthorityProposal = (
  info: PinCodesInfo,
  authority: string,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmwasm.wasm.v1.MsgPinCodes',
            authority: authority,
            code_ids: info.codes_ids,
          }),
        },
      },
    },
  },
});

export const unpinCodesProposal = (info: PinCodesInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmwasm.wasm.v1.MsgUnpinCodes',
            authority: ADMIN_MODULE_ADDRESS,
            code_ids: info.codes_ids,
          }),
        },
      },
    },
  },
});

export const updateInterchaintxsParamsProposal = (
  info: ParamsInterchaintxsInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.interchaintxs.v1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              msg_submit_tx_max_messages: info.msg_submit_tx_max_messages,
            },
          }),
        },
      },
    },
  },
});

export const updateInterchainqueriesParamsProposal = (
  info: ParamsInterchainqueriesInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.interchainqueries.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              query_submit_timeout: info.query_submit_timeout,
              query_deposit: null,
              tx_query_removal_limit: info.tx_query_removal_limit,
            },
          }),
        },
      },
    },
  },
});

export const updateTokenfactoryParamsProposal = (
  info: ParamsTokenfactoryInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/osmosis.tokenfactory.v1beta1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              denom_creation_fee: info.denom_creation_fee,
              denom_creation_gas_consume: info.denom_creation_gas_consume,
              fee_collector_address: info.fee_collector_address,
              whitelisted_hooks: info.whitelisted_hooks,
            },
          }),
        },
      },
    },
  },
});

export const updateFeeburnerParamsProposal = (
  info: ParamsFeeburnerInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.feeburner.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              treasury_address: info.treasury_address,
            },
          }),
        },
      },
    },
  },
});

export const updateTransferParamsProposal = (
  info: ParamsTransferInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/ibc.applications.transfer.v1.MsgUpdateParams',
            signer: ADMIN_MODULE_ADDRESS,
            params: {
              send_enabled: info.send_enabled,
              receive_enabled: info.receive_enabled,
            },
          }),
        },
      },
    },
  },
});

export const updateGlobalFeeParamsProposal = (
  info: ParamsGlobalfeeInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/gaia.globalfee.v1beta1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              minimum_gas_prices: info.minimum_gas_prices,
              bypass_min_fee_msg_types: info.bypass_min_fee_msg_types,
              max_total_bypass_min_fee_msg_gas_usage:
                info.max_total_bypass_min_fee_msg_gas_usage,
            },
          }),
        },
      },
    },
  },
});

export const updateFeerefunderParamsProposal = (
  info: ParamsFeerefunderInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.feerefunder.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              min_fee: info.min_fee,
            },
          }),
        },
      },
    },
  },
});

export const updateCronParamsProposal = (info: ParamsCronInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.cron.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              security_address: info.security_address,
              limit: info.limit,
            },
          }),
        },
      },
    },
  },
});

export const updateDexParamsProposal = (info: ParamsDexInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.dex.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              fee_tiers: info.fee_tiers,
              paused: info.paused,
              max_jits_per_block: info.max_jits_per_block,
              good_til_purge_allowance: info.good_til_purge_allowance,
            },
          }),
        },
      },
    },
  },
});

export const updateContractmanagerParamsProposal = (
  info: ParamsContractmanagerInfo,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.contractmanager.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params: {
              sudo_call_gas_limit: info.sudo_call_gas_limit,
            },
          }),
        },
      },
    },
  },
});

export const updateAdminProposal = (info: UpdateAdmin): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmwasm.wasm.v1.MsgUpdateAdmin',
            sender: info.sender,
            contract: info.contract,
            new_admin: info.new_admin,
          }),
        },
      },
    },
  },
});

export const clearAdminProposal = (info: ClearAdmin): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmwasm.wasm.v1.MsgClearAdmin',
            sender: info.sender,
            contract: info.contract,
          }),
        },
      },
    },
  },
});

export const clientUpdateProposal = (info: ClientUpdateInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        client_update_proposal: {
          title: info.title,
          description: info.description,
          subject_client_id: info.subject_client_id,
          substitute_client_id: info.substitute_client_id,
        },
      },
    },
  },
});

export const upgradeProposal = (info: UpgradeInfo): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        upgrade_proposal: {
          title: info.title,
          description: info.description,
          plan: {
            name: info.name,
            height: info.height,
            info: info.info,
          },
          upgraded_client_state: info.upgraded_client_state,
        },
      },
    },
  },
});

export const addCurrencyPairsProposal = (
  currencyPairs: CurrencyPairInfo[],
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/slinky.oracle.v1.MsgAddCurrencyPairs',
            authority: ADMIN_MODULE_ADDRESS,
            currency_pairs: currencyPairs,
          }),
        },
      },
    },
  },
});

export const addSubdaoProposal = (
  mainDaoCoreAddress: string,
  subdaoCoreAddress: string,
): any => ({
  wasm: {
    execute: {
      contract_addr: mainDaoCoreAddress,
      msg: Buffer.from(
        JSON.stringify({
          update_sub_daos: {
            to_add: [
              {
                addr: subdaoCoreAddress,
              },
            ],
            to_remove: [],
          },
        }),
      ).toString('base64'),
      funds: [],
    },
  },
});

export const sendProposal = (info: SendProposalInfo): any => ({
  bank: {
    send: {
      to_address: info.to,
      amount: [
        {
          denom: info.denom,
          amount: info.amount,
        },
      ],
    },
  },
});

export const addScheduleBindings = (
  name: string,
  period: number,
  msgs: MsgExecuteContract[],
  executionStage: string,
): any => ({
  custom: {
    add_schedule: {
      name,
      period,
      msgs,
      execution_stage: executionStage,
    },
  },
});

export const removeScheduleBindings = (name: string): any => ({
  custom: {
    remove_schedule: {
      name,
    },
  },
});

export const chainManagerWrapper = (
  chainManagerAddress: string,
  proposal: any,
): any => ({
  wasm: {
    execute: {
      contract_addr: chainManagerAddress,
      msg: Buffer.from(
        JSON.stringify({
          execute_messages: {
            messages: [proposal],
          },
        }),
      ).toString('base64'),
      funds: [],
    },
  },
});

export const updateDynamicFeesParamsProposal = (
  params: DynamicFeesParams,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.dynamicfees.v1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params,
          }),
        },
      },
    },
  },
});

export const updateConsumerParamsProposal = (params: ConsumerParams): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/interchain_security.ccv.consumer.v1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            params,
          }),
        },
      },
    },
  },
});

export interface AddSchedule {
  name: string;
  period: number;
  msgs: MsgExecuteContract[];
  execution_stage: number;
}

export interface RemoveSchedule {
  name: string;
}

export const addCronScheduleProposal = (info: AddSchedule): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.cron.MsgAddSchedule',
            authority: ADMIN_MODULE_ADDRESS,
            ...info,
          }),
        },
      },
    },
  },
});

export const removeCronScheduleProposal = (info: RemoveSchedule): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/neutron.cron.MsgRemoveSchedule',
            authority: ADMIN_MODULE_ADDRESS,
            ...info,
          }),
        },
      },
    },
  },
});

export const updateConsensusParamsProposal = (
  params: ConsensusParams,
): any => ({
  custom: {
    submit_admin_proposal: {
      admin_proposal: {
        proposal_execute_message: {
          message: JSON.stringify({
            '@type': '/cosmos.consensus.v1.MsgUpdateParams',
            authority: ADMIN_MODULE_ADDRESS,
            ...params,
          }),
        },
      },
    },
  },
});
