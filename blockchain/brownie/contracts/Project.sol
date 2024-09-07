// SPDX-License-Identifier: MIT 
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;

import "./ProjectLib.sol";
import "./SourceDocument.sol";
import "./SourceDocumentLib.sol";

contract Projects {
    using ProjectLib for mapping(bytes32 => ProjectLib.Project);
    using ProjectLib for mapping(bytes32 => ProjectLib.Indicator);
    using ProjectLib for mapping(bytes32 => ProjectLib.Activity);
    using ProjectLib for mapping(bytes32 => bytes32[]);

    // ProjectLib.Project public _Project;

    //  struct Indicator {
    //     // TODO: key by bytes32 uuid in mapping
    //     bytes32 projectUUID;
    //     string name;
    //     int128 targetQuantity;
    //     string unit;
    //     int128 baseline;
    //     string description;
    //     bool isCumulative;
    //     int128 actual;
    //     bool isIndicator;
    // }

    // struct Location {
    //     int128 lat;
    //     int128 lon;
    // }

    // struct Activity {
    //     bytes32 projectUUID;
    //     int128 date;
    //     bytes32 title;
    //     bytes32 notes;
    //     bytes32 indicator;
    //     Location location;
    //     int128 indicatorAmount;
    //     bool isConfirmed;
    //     bool isActivity;
    //     // List of IPFS hashes of documentary evidence
    //     // of charity activity
    //     bytes[] activityAttachments;
    // }
    
    // struct Project {
    //     string name;
    //     string description;
    //     bool isProject;
    // }

    // struct ExpenseBreakdown {
    //     SourceDocuments.ExpenseTypes expenseType;
    //     int128 amount;
    // }

    mapping(bytes32 => ProjectLib.Project) public projects;
    mapping(bytes32 => ProjectLib.Indicator) public indicators;
    mapping(bytes32 => ProjectLib.Activity) public activities;

    // Mapping linking projects to indicators and activities respectively
    mapping(bytes32 => bytes32[]) public projectIndicators;
    mapping(bytes32 => bytes32[]) public projectActivities;
    
    // Linking activities to their indicator
    mapping(bytes32 => bytes32[]) public indicatorActivities;

    // Mapping for temporary processing of expenses into totals by expense type
    mapping(SourceDocumentLib.ExpenseTypes => int128) private totalByExpenseType;
        
    
    // TODO: delete these 2 from the library
    function projectExists(
        bytes32 _projectUUID
    ) public view returns (bool) {
        // return projects[_projectUUID].isProject;
        return ProjectLib.projectExists(_projectUUID, projects);
        // return projects.projectExists(_projectUUID);
    }

    function indicatorExists(
        bytes32 _indicatorUUID
    ) public view returns (bool) {
        // return indicators[_indicatorUUID].isIndicator;
        
        return ProjectLib.indicatorExists(_indicatorUUID, indicators);
        // return indicators.indicatorExists(_indicatorUUID);
    }

    function getActivities(
        bytes32 _projectUUID
    ) public view returns (ProjectLib.Activity[] memory, ProjectLib.Indicator[] memory) {
        return ProjectLib.getActivities(_projectUUID, activities, projectActivities, indicators);
        // return activities.getActivities(_projectUUID, projectActivities);
    }

    function getIndicators(
        bytes32 _projectUUID
    ) public view returns (ProjectLib.Indicator[] memory) {
        return ProjectLib.getIndicators(_projectUUID, projectIndicators, indicators);
    }

    function setProject(
        bytes32 _projectUUID,
        string memory _name,
        // string memory _description
        uint256 _dateStarted
    ) public returns (bool) {
        // return ProjectLib.setProject(_projectUUID, _name, _description, projects);
        return ProjectLib.setProject(_projectUUID, _name, _dateStarted, projects);
    }

    function setIndicator(
        bytes32 _projectUUID,
        bytes32 _indicatorUUID,
        string memory _name,
        int128 _targetQuantity,
        string memory _unit,
        int128 _baseline,
        string memory _description,
        bool _isCumulative
    ) public returns (bool) {
        return ProjectLib.setIndicator(
            _projectUUID,
            _indicatorUUID,
            _name,
            _targetQuantity,
            _unit,
            _baseline,
            _description,
            _isCumulative,
            indicators,
            projectIndicators
        );
    }

    function setActivity(
        bytes32 _projectUUID,
        bytes32 _activityUUID,
        int128 _date,
        bytes memory _title,
        bytes memory _notes,
        bytes32 _indicatorUUID,
        ProjectLib.Location memory _location,
        int128 _indicatorAmount,
        bytes[] memory _attachments
        // bool _isConfirmed,
        // bool _isActivity
    ) public returns (bool)  {
        return ProjectLib.setActivity(
            _projectUUID,
            _activityUUID,
            _date,
            _title,
            _notes,
            _indicatorUUID,
            _location,
            _indicatorAmount,
            _attachments,
            activities,
            indicators,
            projectActivities,
            indicatorActivities
        );
    }

    function getSpend(bytes32 _projectUUID, address _sourceDocsAddress) public view returns (int128 donated, int128 spent) {
        return ProjectLib.getSpend(
            _projectUUID, 
            _sourceDocsAddress);
    }

    function getExpenseBreakdown(bytes32 _projectUUID, address _sourceDocsAddress) public returns (ProjectLib.ExpenseBreakdown[] memory) {
        return ProjectLib.getExpenseBreakdown(
            _projectUUID,
            _sourceDocsAddress,
            totalByExpenseType);
    }
}