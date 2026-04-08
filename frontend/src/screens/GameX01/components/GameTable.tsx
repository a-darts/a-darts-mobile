import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { styles } from '../styles/GameX01.styles';

export const GameTable = ({ p1, p2, scrollViewRef }: any) => {
    const maxThrows = Math.max(p1.throws.length, p2 ? p2.throws.length : 0);
    const throwRows = Array.from({ length: maxThrows }, (_, i) => ({
        p1: p1.throws[i] ?? null,
        p2: p2 ? p2.throws[i] ?? null : null,
        dartCount: p1.throws[i]?.dartCount ?? (p2?.throws[i]?.dartCount ?? i * 3),
    }));

    return (
        <View style={styles.tableContainer}>
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {throwRows.map((row, index) => {
                    const showP1Score = row.dartCount > 0;
                    const showP2Score = row.dartCount > 0;

                    return (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.spacer} />

                            <View style={styles.tableRowSecondary}>
                                <Text style={[styles.tableCol, styles.tableScore, styles.textRight]}>
                                    {showP1Score ? row.p1?.score : ''}
                                </Text>
                                <Text style={[styles.tableCol, styles.tableRemaining, styles.textRight]}>
                                    {row.p1?.remainingScore ?? ''}
                                </Text>
                            </View>

                            <View style={styles.spacer} />

                            <View style={{ flex: 2, alignItems: 'center' }}>
                                <Text style={styles.tableDartCount}>
                                    {row.dartCount}
                                </Text>
                            </View>

                            {p2 && <View style={styles.spacer} />}

                            {p2 ? (
                                <View style={styles.tableRowSecondary}>
                                    <Text style={[styles.tableCol, styles.tableRemaining, styles.textLeft]}>
                                        {row.p2?.remainingScore ?? ''}
                                    </Text>
                                    <Text style={[styles.tableCol, styles.tableScore, styles.textLeft]}>
                                        {showP2Score ? row.p2?.score : ''}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.spacer} />
                            )}
                            {p2 && <View style={styles.spacer} />}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};
