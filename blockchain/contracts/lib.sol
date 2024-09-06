// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;

library Common {
    // Data shared between contracts
    enum Directions { Debit, Credit }
    enum AccountTypes { Asset, Liability, Income, Expense, Equity }

    // Null value to be used to implement optional function
    // arguments (suggestion by Copilot)
    // bytes32 constant IGNORE = bytes32(0x0);
}