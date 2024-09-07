import { Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Slide, Typography, Alert } from '@mui/material';
import { forwardRef, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
// import { Context } from '../services/context/ContextProvider';
import { Context } from '@/lib/context/ContextProvider';
import dayjs from 'dayjs';
// import { notificationSeen } from '../Hooks/useApi';
import { notificationSeen } from '@/lib/hooks/useApi';
// import { splitCamelCase, formatCurrency, symb } from '../../utils';
import { splitCamelCase, formatCurrency, symb } from '@/lib/utils/utils';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
// import { connectWalletHandler, confirmTransaction } from '../services/blockchain/blockchain_connect';
import { connectWalletHandler, confirmTransaction } from '@/lib/api/blockchain';
dayjs.extend(LocalizedFormat)

// Adapted from https://mui.com/material-ui/react-dialog/#transitions
let Transition = (props, ref) => <Slide direction="up" ref= {ref} {...props} />;
Transition = forwardRef(Transition);

const ConfirmDialog = ({ transaction, onClose, open }) => {

    const queryClient = useQueryClient();

    let { state, dispatch } = useContext(Context);

    let [errorMsg, setErrorMsg] = useState(false);
    // const confirmTransaction = async (signer, )

    const onConfirm = async () => {
        
        try {
            // Mark the notification as 'seen' - returns a promise
            await notificationSeen(queryClient, transaction.uuid);
            // const { errorMessage, provider, signer } = await connectWalletHandler(transaction.message?.to);
            const { errorMessage, provider, signer } = await connectWalletHandler(transaction.message?.to);
            console.log('Confirm transaction blockchain method called with: ', transaction.message?.to);
            console.log(errorMessage, provider, signer);
            if (errorMessage) {
                return setErrorMsg(errorMessage);
            }
            // TODO: change 'expenseUUID' to 'transactionUUID' so it works with
            // other transaction types
            // await confirmTransaction(signer, transaction.message.expenseUUID, transaction.receiver_uuid);
            await confirmTransaction(signer, transaction);
            // Set global context variable to open confirmation dialog
            // dispatch({ type: 'CONFIRM_CLOSE', payload: null });
            onClose();
        } catch (error) {
            console.log('Error during confirmation', error);
            setErrorMsg('Error during confirmation');
        }
    }

    const onReject = () => {
        notificationSeen(queryClient, transaction.uuid);
        // dispatch({ type: 'CONFIRM_CLOSE', payload: null});
        onClose();
    }

    const formattedData = transaction && {
        'Transaction type': splitCamelCase(transaction.message.type)[1],
        'Sender': transaction.sender,
        'Date of transaction': dayjs(transaction.timestamp).format('LL'),
        'Payment method': transaction.message.paymentMethod,
        'Amount': `${symb('GBP')}${formatCurrency(transaction.message.amount / 100)}`
    }

    console.log('Transaction data: ', transaction);

    return (
        <Dialog
            onClose={onClose} 
            open={open}
            TransitionComponent={Transition}
        >
            <DialogTitle>Confirm transaction</DialogTitle>
            <DialogContent>
                {errorMsg && <Alert severity="error" sx={{mb:2}}>{errorMsg}</Alert>}
                <DialogContentText id="confirm-transaction-subtitle" pb={1}>
                    Please confirm the transaction details below are correct.
                </DialogContentText>
                <Grid container spacing={0.5}>
                    {formattedData && Object.entries(formattedData).map(([key, value], idx) => (
                        <>
                            <Grid item xs={6}>
                                <Typography variant="body1" sx={{fontWeight: 'bold'}}>{key}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1" color="text.secondary">{value}</Typography>
                            </Grid>
                        </>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirm}>Confirm</Button>
                <Button onClick={onReject}>Reject</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;