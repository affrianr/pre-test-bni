class UserClass {
  constructor(userID, firstName, lastName, email, phone) {
    this.userID = userID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
  }
}

class MutualFundClass {
  constructor(fundID, fundName, nav) {
    this.fundID = fundID;
    this.fundName = fundName;
    this.nav = nav;
  }
}

class ProcessTransactionsClass {
  constructor(
    transactionID,
    fundID,
    userID,
    transactionDate,
    transactionType,
    units,
    amount,
    nav,
    fees,
    tax,
    totalAmount,
    isPending
  ) {
    this.transactionID = transactionID;
    this.fundID = fundID;
    this.userID = userID;
    this.transactionDate = transactionDate;
    this.transactionType = transactionType;
    this.units = units;
    this.amount = amount;
    this.nav = nav;
    this.fees = fees;
    this.tax = tax;
    this.totalAmount = totalAmount;
    this.isPending = isPending;
  }
}

class MutualFundsTransactionsClass {
  constructor(
    transactionID,
    fundID,
    userID,
    transactionDate,
    transactionType,
    units,
    amount,
    nav,
    fees,
    tax,
    totalAmount
  ) {
    this.transactionID = transactionID;
    this.fundID = fundID;
    this.userID = userID;
    this.transactionDate = transactionDate;
    this.transactionType = transactionType;
    this.units = units;
    this.amount = amount;
    this.nav = nav;
    this.fees = fees;
    this.tax = tax;
    this.totalAmount = totalAmount;
  }
}

module.exports = {
  UserClass,
  MutualFundClass,
  ProcessTransactionsClass,
  MutualFundsTransactionsClass,
};
