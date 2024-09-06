# End-to-end tests of the blockchain integration

class BlockchainTest(APITestCase):
    def test_blockchain(self):
        # Test that the blockchain provider is working
        self.assertTrue(blockchain_provider.is_connected())

        # Test that the blockchain provider is returning the correct data
        self.assertTrue(brownie_blockchains.get_new_events())

        # Test that the blockchain provider is processing the events correctly
        self.assertTrue(is_event_empty(brownie_blockchains.get_new_events()))

        # Test that the blockchain provider is processing the events correctly
        self.assertTrue(brownie_blockchains.process_event(
            'test_event', {'test': 'data'}))

    def test_expense_event_emitted(self):
        # Call create expense

        # Check that the event is emitted and a Notification is produced correctly
        pass

    def test_donation_created(self):
        # Create a donation, check corresponding record is created in blockchain
        pass

    # def test_expense_created and test_project_created (for each of them)
    # def
