DROP table IF EXISTS actionsCopy;
CREATE table actionsCopy LIKE actions;

INSERT INTO actionsCopy (SELECT 

    id, 
    amount, 
    percent, 
    amount as res, 
    actionTypeId, 
    customerId, 
    messageId, 
    action_type, 
    aish_balance, 
    transactionId, 
    hasMessage, 
    note, 
    deletedNote, 
    owner, 
    createdAt, 
    updatedAt, 
    deletedAt, 
    actionId

 FROM
    (SELECT 

        null as id, 
        COALESCE((SELECT SUM(res) FROM actions WHERE actions.customerId=customersDistincted.customerId AND deletedAt is NULL), 0) as amount, 
        percent, 
        0 as res, 
        1 as actionTypeId, 
        customerId, 
        null as messageId, 
        'NONE' as action_type, 
        0 as aish_balance, 
        null as transactionId, 
        0 as hasMessage, 
        null as note, 
        null as deletedNote, 
        'awtomatic' as owner, 
        '2024-05-31 22:00:00' as createdAt, 
        '2024-05-31 22:00:00' as updatedAt, 
        null as deletedAt, 
        null as actionId
        
    FROM (SELECT DISTINCT customerId FROM actions) customersDistincted RIGHT JOIN customers ON customersDistincted.customerId=customers.id) preparedTable WHERE amount>0);
    
#**************************************************************************************************
    
DROP table IF EXISTS actionsOld;
CREATE table actionsOld LIKE actions;
INSERT INTO actionsOld (SELECT * FROM actions);

DELETE FROM actions WHERE 1;
DELETE FROM messages WHERE 1;
DELETE FROM _transactions WHERE 1;

INSERT INTO actions (SELECT * FROM actionsCopy);

