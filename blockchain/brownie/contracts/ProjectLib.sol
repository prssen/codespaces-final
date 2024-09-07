// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

// import "../lib/HitchensUnorderedKeySet.sol";
import "./Transaction.sol";
import "./SourceDocument.sol";

// TODO: client side code needs to convert decimals to integers
library ProjectLib {

    // using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
    // HitchensUnorderedKeySetLib.Set transactionSet;

    struct Indicator {
        // TODO: key by bytes32 uuid in mapping
        bytes32 projectUUID;
        string name;
        int128 targetQuantity;
        string unit;
        int128 baseline;
        string description;
        bool isCumulative;
        int128 actual;
        bool isIndicator;
    }

    struct Location {
        bytes name;
        int128 lat;
        int128 lon;
        bool isLocation;
    }

    struct Activity {
        bytes32 projectUUID;
        int128 date;
        bytes title;
        bytes notes;
        bytes32 indicator;
        Location location;
        int128 indicatorAmount;
        bool isConfirmed;
        bool isActivity;
        // List of IPFS hashes of documentary evidence
        // of charity activity
        bytes[] activityAttachments;
    }
    
    struct Project {
        string name;
        // string description;
        uint256 dateStarted;
        bool isProject;
    }

    struct ExpenseBreakdown {
        SourceDocumentLib.ExpenseTypes expenseType;
        int128 amount;
    }

    // mapping(bytes32 => Project) public projects;
    // mapping(bytes32 => Indicator) public indicators;
    // mapping(bytes32 => Activity) public activities;

    // // Mapping linking projects to indicators and activities respectively
    // mapping(bytes32 => bytes32[]) public projectIndicators;
    // mapping(bytes32 => bytes32[]) public projectActivities;
    
    // // Linking activities to their indicator
    // mapping(bytes32 => bytes32[]) public indicatorActivities;

    // // Mapping for temporary processing of expenses into totals by expense type
    // mapping(SourceDocuments.ExpenseTypes => int128) private totalByExpenseType;
        

    function projectExists(
        bytes32 _projectUUID,
        mapping(bytes32 => Project) storage projects
    ) public view returns (bool) {
        return projects[_projectUUID].isProject;
    }

    function indicatorExists(
        bytes32 _indicatorUUID,
        mapping(bytes32 => Indicator) storage indicators
    ) public view returns (bool) {
        return indicators[_indicatorUUID].isIndicator;
    }

    /// @notice Get all activities relating to a project
    /// @param _projectUUID a UUID for the project, retrieved from the database
    /// @return array of Activity structs
    function getActivities(
        bytes32 _projectUUID,
        mapping(bytes32 => Activity) storage activities,
        mapping(bytes32 => bytes32[]) storage projectActivities,
        mapping(bytes32 => Indicator) storage indicators
    ) public view returns (Activity[] memory, Indicator[] memory) {
        // Retrieve list of activity UUIDs for the selected project
        bytes32[] memory activityIDs = projectActivities[_projectUUID];
        Activity[] memory _activities = new Activity[](activityIDs.length);
        Indicator[] memory _indicators = new Indicator[](activityIDs.length);
        for (uint i = 0; i < activityIDs.length; i++) {
            _activities[i] = activities[activityIDs[i]];
            // TODO: replace with data structure that eliminates duplicates
            // (ideally mapping, but we can't return that)
            _indicators[i] = indicators[_activities[i].indicator];
        }
        
        return (_activities, _indicators);
    }

    function getIndicators(
        bytes32 _projectUUID,
        mapping(bytes32 => bytes32[]) storage projectIndicators,
        mapping(bytes32 => Indicator) storage indicators
    ) public view returns (Indicator[] memory) {
        // Retrieve list of activity UUIDs for the selected project
        bytes32[] memory indicatorIDs = projectIndicators[_projectUUID];
        Indicator[] memory _indicators = new Indicator[](indicatorIDs.length);
        for (uint i = 0; i < indicatorIDs.length; i++) {
            _indicators[i] = indicators[indicatorIDs[i]];
        }
        
        return _indicators;
    }

    function setProject(
        bytes32 _projectUUID,
        string memory _name,
        uint256 _dateStarted,
        // string memory _description,
        mapping(bytes32 => Project) storage projects
    ) public returns (bool) {
        projects[_projectUUID].name = _name;
        // projects[_projectUUID].description = _description;
        projects[_projectUUID].dateStarted = _dateStarted;
        projects[_projectUUID].isProject = true;

        return true;
    }

    function setIndicator(
        bytes32 _projectUUID,
        bytes32 _indicatorUUID,
        string memory _name,
        int128 _targetQuantity,
        string memory _unit,
        int128 _baseline,
        string memory _description,
        bool _isCumulative,
        mapping(bytes32 => Indicator) storage indicators,
        mapping(bytes32 => bytes32[]) storage projectIndicators
    ) public returns (bool) {
        // Create indicator
        indicators[_indicatorUUID].projectUUID = _projectUUID;
        indicators[_indicatorUUID].name = _name;
        indicators[_indicatorUUID].targetQuantity = _targetQuantity;
        indicators[_indicatorUUID].unit = _unit;
        indicators[_indicatorUUID].baseline = _baseline;
        indicators[_indicatorUUID].description = _description;
        indicators[_indicatorUUID].isCumulative = _isCumulative;
        indicators[_indicatorUUID].actual = 0;
        indicators[_indicatorUUID].isIndicator = true;

        // Link indicator to project
        {
            projectIndicators[_projectUUID].push(_indicatorUUID);
        }

        return true;
    }

    /// @notice Create new activity.
    /// @dev  Also updates the indicator's running total as a side effect.
    function setActivity(
        bytes32 _projectUUID,
        bytes32 _activityUUID,
        int128 _date,
        bytes memory _title,
        bytes memory _notes,
        bytes32 _indicator,
        Location memory _location,
        int128 _indicatorAmount,
        bytes[] memory _attachments,
        mapping(bytes32 => Activity) storage activities,
        mapping(bytes32 => Indicator) storage indicators,
        mapping(bytes32 => bytes32[]) storage projectActivities,
        mapping(bytes32 => bytes32[]) storage indicatorActivities
        // bool _isConfirmed,
        // bool _isActivity
    ) internal returns (bool) {
        // First check the indicator exists
        {
            bool doesExist = indicatorExists(_indicator, indicators);
            require(doesExist, "Indicator does not exist");
        }
        // Create activity    
        {
            activities[_activityUUID].projectUUID = _projectUUID;
            activities[_activityUUID].date = _date;
            activities[_activityUUID].title = _title;
            activities[_activityUUID].notes = _notes;
            activities[_activityUUID].indicator = _indicator;
            activities[_activityUUID].location = _location;
            activities[_activityUUID].indicatorAmount = _indicatorAmount;
            activities[_activityUUID].isConfirmed = false;
            activities[_activityUUID].isActivity = true;
            activities[_activityUUID].activityAttachments = _attachments;
        }
        // Update indicator's current total by adding the
        // contribution of the activity
        {
            Indicator memory currentIndicator = indicators[_indicator];
            if (currentIndicator.isCumulative) {
                currentIndicator.actual += _indicatorAmount;
            } else {
                currentIndicator.actual = _indicatorAmount;
            }
        }

        // Link activity to indicator in mapping
        {
            // Need this code to check if array is empty before pushing to it,
            // otherwise the nil value '0' is added to the array:
            // can't assign to an intermediate variable for readability because
            // of issues with memory variables
            // if (indicatorActivities[_indicator].length == 0) {
            //     indicatorActivities[_indicator][0] = _activityUUID;
            // } else {
            //     indicatorActivities[_indicator].push(_activityUUID);
            // }
            indicatorActivities[_indicator].push(_activityUUID);
            // indicatorActivities[_indicator].push(_activityUUID);
        }
        // Link activity to project
        {
            projectActivities[_projectUUID].push(_activityUUID);
        }

        return true;
    }

    function getSpend(bytes32 _projectUUID, address sourceDocsContractAddress) public view returns (int128 donated, int128 spent) {
        // Get donations for project
        // TODO: ideally, get all transaction entries with 'INC' account type + project UUID innstead
        // (to account for non-donation sources of funding, e.g. trading income/grants)
        SourceDocuments _contract = SourceDocuments(sourceDocsContractAddress);
        // SourceDocumentLib.Donation[] memory _donations = SourceDocuments(sourceDocsContractAddress).getProjectDonations(_projectUUID);
        SourceDocumentLib.Donation[] memory _donations = _contract.getProjectDonations(_projectUUID);
        int128 donationTotal = 0;
        for (uint256 i = 0; i < _donations.length; i++) {
            donationTotal += _donations[i].total;
        }

        // Get expenses for project
        SourceDocumentLib.Expense[] memory _expenses = _contract.getProjectExpenses(_projectUUID);
        int128 expenseTotal = 0;
        for (uint256 i = 0; i < _expenses.length; i++) {
            expenseTotal += _expenses[i].total;
        }
    
        // Return total of both
        return (donationTotal, expenseTotal);
    }


    function getExpenseBreakdown(
        bytes32 _projectUUID,
        address sourceDocsContractAddress,
        mapping(SourceDocumentLib.ExpenseTypes => int128) storage totalByExpenseType
    ) public returns (
        ExpenseBreakdown[] memory
        // mapping(SourceDocumentLib.ExpenseTypes => int128) storage totalByExpenseType
        ) {
        // Get expense transactions for project
        SourceDocuments sourceDocs = SourceDocuments(sourceDocsContractAddress);
        SourceDocumentLib.Expense[] memory projectExpenses = sourceDocs.getProjectExpenses(_projectUUID);

        // Iterate through expenses, and add amounts to group-wise running
        // total
        for (uint i = 0; i < projectExpenses.length; i++) {
            totalByExpenseType[projectExpenses[i].expenseType] += projectExpenses[i].total;
        }

        ExpenseBreakdown[] memory expenseBreakdown 
            = new ExpenseBreakdown[](
                    // uint(type(SourceDocumentLib.ExpenseTypes).max)
                    uint(9)
                );

        // As we can't return a mapping from a Solidity function, convert it into
        // a struct which we can return
        // for (uint i = 0; i < uint(type(SourceDocumentLib.ExpenseTypes).max); i++) {
        for (uint i = 0; i < uint(9); i++) {
        
            ExpenseBreakdown memory _exp = ExpenseBreakdown({
                expenseType: SourceDocumentLib.ExpenseTypes(i),
                amount: totalByExpenseType[SourceDocumentLib.ExpenseTypes((i))]
            });

            expenseBreakdown[i] = _exp;
        }

        return expenseBreakdown;
    }

}