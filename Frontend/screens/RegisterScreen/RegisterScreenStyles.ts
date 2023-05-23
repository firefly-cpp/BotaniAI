import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    eye: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "90%",
        justifyContent: 'center',
    },
    puscica: {
        position: 'absolute',
        left: 10,
        top: 10,
        marginTop: "10%",
        marginLeft: "1%"
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#648983',
        fontSize: 16,
        paddingVertical: 2,
        marginVertical: 20,
        paddingHorizontal: 5,
        color: "#648983",
        width: "70%",
    },
    create: {
        color: 'black',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: '10%',
    },
    icon: {
        borderBottomWidth: 1,
        borderBottomColor: '#648983',
        paddingVertical: 3,
        paddingHorizontal: 5,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button1: {
        color: 'white',
        backgroundColor: '#30312c',
        width: '70%',
        height: 45,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        textTransform: 'uppercase',
        fontSize: 10,
        color: 'white',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
