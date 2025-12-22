// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GovChain {
    enum Status {
        Submitted,
        Received,
        Assigned,
        Processing,
        Approved,
        Rejected
    }

    struct CaseFile {
        uint256 id;
        address citizen;
        string citizenId;
        string fileHash;
        string description;
        Status status;
        uint256 createdAt;
    }

    struct CaseLog {
        uint256 caseId;
        Status status;
        address actor;
        uint256 timestamp;
        string note;
    }

    uint256 public caseCounter;
    mapping(uint256 => CaseFile) public cases;
    mapping(uint256 => CaseLog[]) public caseLogs;
    mapping(address => uint256[]) private userCases;

    event CaseSubmitted(uint256 caseId, address citizen);
    event CaseStatusUpdated(uint256 caseId, Status status, address actor, string note);

    function submitCase(
        string memory _citizenId,
        string memory _fileHash,
        string memory _description
    ) public returns (uint256) {
        caseCounter++;
        uint256 newId = caseCounter;

        cases[newId] = CaseFile({
            id: newId,
            citizen: msg.sender,
            citizenId: _citizenId,
            fileHash: _fileHash,
            description: _description,
            status: Status.Submitted,
            createdAt: block.timestamp
        });

        userCases[msg.sender].push(newId);

        caseLogs[newId].push(CaseLog({
            caseId: newId,
            status: Status.Submitted,
            actor: msg.sender,
            timestamp: block.timestamp,
            note: "Submitted"
        }));

        emit CaseSubmitted(newId, msg.sender);
        return newId;
    }

    function updateStatus(
        uint256 _caseId,
        Status _status,
        string memory _note
    ) public {
        require(_caseId > 0 && _caseId <= caseCounter, "Invalid case");
        CaseFile storage cf = cases[_caseId];

        // Demo: mọi địa chỉ có thể cập nhật (sau này thêm role-check)
        cf.status = _status;

        caseLogs[_caseId].push(CaseLog({
            caseId: _caseId,
            status: _status,
            actor: msg.sender,
            timestamp: block.timestamp,
            note: _note
        }));

        emit CaseStatusUpdated(_caseId, _status, msg.sender, _note);
    }

    function getCase(uint256 _caseId) public view returns (CaseFile memory) {
        require(_caseId > 0 && _caseId <= caseCounter, "Invalid case");
        return cases[_caseId];
    }

    function getCaseLogs(uint256 _caseId) public view returns (CaseLog[] memory) {
        return caseLogs[_caseId];
    }

    function getMyCases() public view returns (CaseFile[] memory) {
        uint256[] memory ids = userCases[msg.sender];
        CaseFile[] memory myCases = new CaseFile[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            myCases[i] = cases[ids[i]];
        }
        return myCases;
    }

    function getAllCases() public view returns (CaseFile[] memory) {
        CaseFile[] memory allCases = new CaseFile[](caseCounter);
        
        for (uint256 i = 0; i < caseCounter; i++) {
            allCases[i] = cases[i + 1];
        }
        return allCases;
    }
}
